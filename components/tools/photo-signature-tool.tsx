"use client";

import { useState } from "react";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { Checkbox, FieldLabel, inputClass, Segmented } from "@/components/controls/fields";
import { DownloadButton } from "@/components/download-button/download-button";
import { ImagePreview } from "@/components/image-preview/image-preview";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { newSourceId } from "@/lib/image-processing/client";
import { toImageToolError, type ImageToolError } from "@/lib/image-processing/errors";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { mergeLayout, type MergeLayoutOptions } from "@/lib/image-processing/merge-layout";
import { formatBytes, formatDimensions, KB, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useObjectUrl, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton } from "./tool-workspace";

const TOOL = "merge-photo-and-signature" as const;

type Placement = "below" | "beside";
type Gap = "0" | "10" | "20";

/** Same clean-up the signature resizer uses: grey paper becomes white, the ink stays. */
const SIGNATURE_CLEANUP = { threshold: 190, to: "white" as const };

interface Joined {
  key: string;
  blob: Blob;
  width: number;
  height: number;
  /** A maximum size was set but couldn't be reached. */
  overMax: boolean;
}

function optionalNumber(text: string): number | undefined | null {
  if (!text.trim()) return undefined;
  const n = Number(text.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function PhotoSignatureTool() {
  useToolOpen(TOOL);
  const photo = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const signature = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const [placement, setPlacement] = useState<Placement>("below");
  const [gap, setGap] = useState<Gap>("10");
  const [cleanSignature, setCleanSignature] = useState(true);
  const [widthText, setWidthText] = useState("");
  const [maxKBText, setMaxKBText] = useState("");
  const [error, setError] = useState<ImageToolError | null>(null);
  const [result, setResult] = useState<Joined | null>(null);

  const p = photo.source;
  const s = signature.source;
  const outWidth = optionalNumber(widthText);
  const maxKB = optionalNumber(maxKBText);
  const widthError = outWidth === null || (outWidth !== undefined && (!Number.isInteger(outWidth) || outWidth < 100 || outWidth > 4000));
  const kbError = maxKB === null || (maxKB !== undefined && maxKB < 5);
  const settingsError = widthError ? "Enter a width between 100 and 4000 pixels, or leave it empty." : kbError ? "Enter a maximum of at least 5 KB, or leave it empty." : null;

  const layoutOptions: MergeLayoutOptions = { direction: placement === "below" ? "vertical" : "horizontal", match: "first", columns: 1, spacing: Number(gap) };
  const preview = p && s ? mergeLayout([p, s], layoutOptions) : null;
  // The final size keeps the merged shape: only the width is chosen, the height follows.
  const finalSize = preview
    ? outWidth && !widthError
      ? { width: outWidth, height: Math.max(1, Math.round((preview.height * outWidth) / preview.width)) }
      : { width: preview.width, height: preview.height }
    : null;
  const key = p && s ? JSON.stringify([p.id, s.id, layoutOptions, cleanSignature, outWidth ?? null, maxKB ?? null]) : "";
  const current = result?.key === key ? result : null;
  const url = useObjectUrl(current?.blob ?? null);

  const join = async (photoImage: SourceImage, signatureImage: SourceImage) => {
    if (settingsError || !finalSize) return;
    setError(null);
    track("processing_started", { tool: TOOL, mode: placement });
    try {
      let signatureFile: Blob = signatureImage.file;
      if (cleanSignature) {
        const cleaned = await runner.run({
          kind: "encode",
          sourceId: signatureImage.id,
          file: signatureImage.file,
          width: signatureImage.width,
          height: signatureImage.height,
          mime: "image/png",
          background: "#ffffff",
          cleanup: SIGNATURE_CLEANUP,
        });
        if (!cleaned) return;
        signatureFile = cleaned.blob;
      }
      const resize = Boolean(outWidth) || Boolean(maxKB);
      // With a size or KB limit to apply next, merge losslessly first so the photo is only compressed once.
      const merged = await runner.run({
        kind: "merge",
        sourceId: photoImage.id,
        file: photoImage.file,
        files: [photoImage.file, signatureFile],
        layout: layoutOptions,
        background: "#ffffff",
        mime: resize ? "image/png" : "image/jpeg",
        quality: resize ? undefined : 0.92,
      });
      if (!merged) return;
      let out = { blob: merged.blob, width: merged.width, height: merged.height };
      let overMax = false;
      if (resize) {
        const base = { sourceId: newSourceId(), file: merged.blob, noCache: true };
        const exact = outWidth ? { width: finalSize.width, height: finalSize.height } : {};
        if (maxKB) {
          const fitted = await runner.run({
            ...base,
            ...exact,
            kind: "target",
            sourceMime: "image/png",
            targetBytes: Math.floor(maxKB * KB),
            mime: "image/jpeg",
            allowResize: !outWidth,
            background: "#ffffff",
          });
          if (!fitted) return;
          out = fitted;
          overMax = fitted.outcome !== "met";
        } else {
          const encoded = await runner.run({ ...base, kind: "encode", width: finalSize.width, height: finalSize.height, mime: "image/jpeg", quality: 0.92, background: "#ffffff" });
          if (!encoded) return;
          out = encoded;
        }
      }
      setResult({ key, ...out, overMax });
      track("photo_signature_merged", { tool: TOOL, mode: placement, outcome: overMax ? "over-max" : "met", size_bucket: sizeBucket(out.blob.size) });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const reset = () => {
    runner.cancel();
    photo.clear();
    signature.clear();
    setResult(null);
    setError(null);
  };

  if (!p) {
    return (
      <div className="space-y-4">
        {photo.error ? <Alert tone="error" title="We couldn't use that file">{photo.error.message}</Alert> : null}
        <ImageDropzone accept={RASTER_INPUT_FORMATS} onFile={photo.select} loading={photo.loading} prompt="Step 1: drop your photo" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-label="Photo and signature" className="space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Slot label="Photo" image={p} onClear={reset} clearLabel="Start over" />
          {s ? (
            <Slot label="Signature" image={s} onClear={() => { runner.cancel(); signature.clear(); setResult(null); setError(null); }} clearLabel="Change signature" />
          ) : (
            <div className="space-y-3">
              {signature.error ? <Alert tone="error" title="We couldn't use that file">{signature.error.message}</Alert> : null}
              <ImageDropzone accept={RASTER_INPUT_FORMATS} onFile={signature.select} loading={signature.loading} prompt="Step 2: add your signature" compact acceptHandOff={false} />
            </div>
          )}
        </div>
      </section>

      {s && preview && finalSize ? (
        <section aria-label="Settings" className="space-y-5 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Segmented<Placement>
              legend="Signature position"
              value={placement}
              onChange={setPlacement}
              hint="The signature is scaled to the photo's width (below) or height (beside), never stretched."
              options={[
                { value: "below", label: "Below the photo" },
                { value: "beside", label: "Beside the photo" },
              ]}
            />
            <Segmented<Gap>
              legend="White gap"
              value={gap}
              onChange={setGap}
              options={[
                { value: "0", label: "None" },
                { value: "10", label: "10 px" },
                { value: "20", label: "20 px" },
              ]}
            />
            <div>
              <FieldLabel htmlFor="joiner-width">Final width (px)</FieldLabel>
              <input id="joiner-width" inputMode="numeric" placeholder="Optional" value={widthText} onChange={(e) => setWidthText(e.target.value)} aria-invalid={widthError} className={`${inputClass} mt-1.5`} />
            </div>
            <div>
              <FieldLabel htmlFor="joiner-kb">Max file size (KB)</FieldLabel>
              <input id="joiner-kb" inputMode="decimal" placeholder="Optional" value={maxKBText} onChange={(e) => setMaxKBText(e.target.value)} aria-invalid={kbError} className={`${inputClass} mt-1.5`} />
            </div>
          </div>
          <Checkbox checked={cleanSignature} onChange={setCleanSignature} description="Turns grey or shadowed paper behind the signature pure white; the ink is kept.">
            Clean the signature background
          </Checkbox>
          {settingsError ? (
            <p className="text-sm font-medium text-danger-ink" role="alert">
              {settingsError}
            </p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-ink">
              Preview <span className="font-normal text-muted">· {formatDimensions(finalSize.width, finalSize.height)} JPG{maxKB && !kbError ? `, up to ${maxKB} KB` : ""}</span>
            </p>
            <div
              className="relative mx-auto mt-2 max-h-80 overflow-hidden border border-line bg-white"
              style={{ aspectRatio: `${preview.width} / ${preview.height}`, maxWidth: `min(100%, calc(20rem * ${preview.width} / ${preview.height}))` }}
              role="img"
              aria-label={`Layout preview: signature ${placement === "below" ? "below" : "beside"} the photo`}
            >
              {[p, s].map((item, index) => {
                const r = preview.rects[index];
                return (
                  <img
                    key={item.id}
                    src={item.url}
                    alt=""
                    className="absolute max-w-none"
                    style={{ left: `${(r.x / preview.width) * 100}%`, top: `${(r.y / preview.height) * 100}%`, width: `${(r.width / preview.width) * 100}%`, height: `${(r.height / preview.height) * 100}%` }}
                  />
                );
              })}
            </div>
          </div>

          {error ? (
            <Alert tone="error" title="The images couldn't be joined">
              {error.message}
            </Alert>
          ) : null}
          <ActionButton onClick={() => join(p, s)} busy={runner.busy} busyLabel="Joining…" progress={runner.progress} disabled={Boolean(settingsError)}>
            {current ? "Join again" : "Join photo and signature"}
          </ActionButton>
        </section>
      ) : null}

      {current && url ? (
        <section aria-labelledby="result-heading" className="rounded-lg border border-line bg-canvas shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2 id="result-heading" tabIndex={-1} className="text-lg font-bold text-ink outline-none">
                Your photo with signature
              </h2>
              <p className="mt-0.5 text-sm text-muted" aria-live="polite">
                JPG · {formatDimensions(current.width, current.height)} · {formatBytes(current.blob.size)}
              </p>
            </div>
            <DownloadButton href={url} fileName={`photo-with-signature-${current.width}x${current.height}.jpg`} label="Download JPG" tool={TOOL} outputFormat="JPG" />
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            {current.overMax ? (
              <Alert tone="warning" title={`Couldn't get under ${maxKB} KB at this width`}>
                The smallest file at {formatDimensions(current.width, current.height)} is {formatBytes(current.blob.size)}. Leave the width
                empty so the size can be reduced as well, or allow a larger file.
              </Alert>
            ) : null}
            <ImagePreview src={url} alt={`Photo with the signature ${placement === "below" ? "below" : "beside"} it, ${formatDimensions(current.width, current.height)}`} width={current.width} height={current.height} className="h-64 sm:h-96" />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Slot({ label, image, onClear, clearLabel }: { label: string; image: SourceImage; onClear: () => void; clearLabel: string }) {
  return (
    <figure className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
      <img src={image.url} alt={`Your ${label.toLowerCase()}`} className="h-20 w-20 shrink-0 rounded border border-line bg-white object-contain" />
      <figcaption className="min-w-0 text-sm">
        <p className="font-semibold text-ink">{label}</p>
        <p className="truncate text-muted">
          {formatDimensions(image.width, image.height)} · {formatBytes(image.size)}
        </p>
        <button type="button" onClick={onClear} className={buttonClass("ghost", "mt-1 min-h-9 px-2 text-sm")}>
          {clearLabel}
        </button>
      </figcaption>
    </figure>
  );
}
