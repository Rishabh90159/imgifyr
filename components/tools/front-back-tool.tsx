"use client";

import { useState } from "react";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { FieldLabel, inputClass, Segmented } from "@/components/controls/fields";
import { DownloadButton } from "@/components/download-button/download-button";
import { ImagePreview } from "@/components/image-preview/image-preview";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { newSourceId } from "@/lib/image-processing/client";
import { toImageToolError, type ImageToolError } from "@/lib/image-processing/errors";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { mergeLayout, type MergeLayoutOptions } from "@/lib/image-processing/merge-layout";
import { buildPdf, MARGINS, PAGE_SIZES, placeImage, type Placement } from "@/lib/pdf/pdf-writer";
import { mmToPoints } from "@/lib/presets/print-sheet";
import { formatBytes, formatDimensions, KB, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useObjectUrl, useRevealResult, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton } from "./tool-workspace";

const TOOL = "aadhaar-front-and-back" as const;

type Layout = "stacked" | "side";
type Gap = "0" | "20" | "40";
type Output = "jpg" | "pdf";
type PrintSize = "card" | "page";

/** ISO/IEC 7810 ID-1, the size of a PVC Aadhaar, PAN or bank card. */
const CARD_MM = { width: 85.6, height: 54 };
/** PDF bytes around the embedded JPG, kept out of the KB limit so the whole file stays under it. */
const PDF_OVERHEAD_KB = 2;

interface Combined {
  key: string;
  blob: Blob;
  /** The combined picture; for a PDF, the JPG embedded in the page. */
  image: Blob;
  output: Output;
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

/** One A4 portrait page: at card size, centred near the top so the sides print the size of the card, or fitted to the page. */
function pagePlacement(width: number, height: number, layout: Layout, size: PrintSize): Placement {
  if (size === "page") return placeImage(width, height, { size: "a4", orientation: "portrait", fit: "fit", margin: MARGINS.large });
  const page = PAGE_SIZES.a4;
  // Stacked sides share the width; side-by-side sides share the height.
  const scale = layout === "stacked" ? mmToPoints(CARD_MM.width) / width : mmToPoints(CARD_MM.height) / height;
  const w = Math.min(width * scale, page.width - MARGINS.large * 2);
  const h = (height * w) / width;
  return { pageWidth: page.width, pageHeight: page.height, x: (page.width - w) / 2, y: page.height - MARGINS.large - h, width: w, height: h, clip: null };
}

export function FrontBackTool() {
  useToolOpen(TOOL);
  const front = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const back = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const [layout, setLayout] = useState<Layout>("stacked");
  const [gap, setGap] = useState<Gap>("20");
  const [output, setOutput] = useState<Output>("pdf");
  const [printSize, setPrintSize] = useState<PrintSize>("card");
  const [maxKBText, setMaxKBText] = useState("");
  const [error, setError] = useState<ImageToolError | null>(null);
  const [result, setResult] = useState<Combined | null>(null);

  const f = front.source;
  const b = back.source;
  const maxKB = optionalNumber(maxKBText);
  const kbError = maxKB === null || (maxKB !== undefined && maxKB < 10);
  const layoutOptions: MergeLayoutOptions = { direction: layout === "stacked" ? "vertical" : "horizontal", match: "smallest", columns: 1, spacing: Number(gap) };
  const preview = f && b ? mergeLayout([f, b], layoutOptions) : null;
  const key = f && b ? JSON.stringify([f.id, b.id, layoutOptions, output, output === "pdf" ? printSize : null, maxKB ?? null]) : "";
  const current = result?.key === key ? result : null;
  const url = useObjectUrl(current?.blob ?? null);
  const imageUrl = useObjectUrl(current?.image ?? null);
  const resultHeading = useRevealResult(current ? url : null);

  const combine = async (frontImage: SourceImage, backImage: SourceImage) => {
    if (kbError) return;
    setError(null);
    track("processing_started", { tool: TOOL, mode: layout, output_format: output.toUpperCase() });
    try {
      // With a KB limit to apply next, merge losslessly first so the pictures are compressed only once.
      const merged = await runner.run({
        kind: "merge",
        sourceId: frontImage.id,
        file: frontImage.file,
        files: [frontImage.file, backImage.file],
        layout: layoutOptions,
        background: "#ffffff",
        mime: maxKB ? "image/png" : "image/jpeg",
        quality: maxKB ? undefined : 0.92,
      });
      if (!merged) return;
      let jpg = { blob: merged.blob, width: merged.width, height: merged.height };
      let overMax = false;
      if (maxKB) {
        const budget = output === "pdf" ? maxKB - PDF_OVERHEAD_KB : maxKB;
        const fitted = await runner.run({
          sourceId: newSourceId(),
          file: merged.blob,
          noCache: true,
          kind: "target",
          sourceMime: "image/png",
          targetBytes: Math.floor(budget * KB),
          mime: "image/jpeg",
          allowResize: true,
          background: "#ffffff",
        });
        if (!fitted) return;
        jpg = fitted;
        overMax = fitted.outcome !== "met";
      }
      const blob =
        output === "pdf"
          ? buildPdf([
              {
                image: { jpeg: jpg.blob, width: jpg.width, height: jpg.height, colorSpace: "DeviceRGB" },
                placement: pagePlacement(jpg.width, jpg.height, layout, printSize),
              },
            ])
          : jpg.blob;
      if (maxKB && blob.size > maxKB * KB) overMax = true;
      setResult({ key, blob, image: jpg.blob, output, width: jpg.width, height: jpg.height, overMax });
      track("images_merged", { tool: TOOL, mode: layout, output_format: output.toUpperCase(), size_bucket: sizeBucket(blob.size) });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const reset = () => {
    runner.cancel();
    front.clear();
    back.clear();
    setResult(null);
    setError(null);
  };

  if (!f) {
    return (
      <div className="space-y-4">
        {front.error ? <Alert tone="error" title="We couldn't use that file">{front.error.message}</Alert> : null}
        <ImageDropzone accept={RASTER_INPUT_FORMATS} onFile={front.select} loading={front.loading} prompt="Step 1: drop the front side" />
      </div>
    );
  }

  const label = output === "pdf" ? "PDF" : "JPG";

  return (
    <div className="space-y-6">
      <section aria-label="Front and back" className="space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Slot label="Front" image={f} onClear={reset} clearLabel="Start over" />
          {b ? (
            <Slot label="Back" image={b} onClear={() => { runner.cancel(); back.clear(); setResult(null); setError(null); }} clearLabel="Change back side" />
          ) : (
            <div className="space-y-3">
              {back.error ? <Alert tone="error" title="We couldn't use that file">{back.error.message}</Alert> : null}
              <ImageDropzone accept={RASTER_INPUT_FORMATS} onFile={back.select} loading={back.loading} prompt="Step 2: add the back side" compact acceptHandOff={false} />
            </div>
          )}
        </div>
      </section>

      {b && preview ? (
        <section aria-label="Settings" className="space-y-5 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Segmented<Layout>
              legend="Layout"
              value={layout}
              onChange={setLayout}
              hint="The larger side is scaled down to match the other, never stretched."
              options={[
                { value: "stacked", label: "Front above back" },
                { value: "side", label: "Side by side" },
              ]}
            />
            <Segmented<Gap>
              legend="White gap"
              value={gap}
              onChange={setGap}
              options={[
                { value: "0", label: "None" },
                { value: "20", label: "20 px" },
                { value: "40", label: "40 px" },
              ]}
            />
            <Segmented<Output>
              legend="Save as"
              value={output}
              onChange={setOutput}
              options={[
                { value: "pdf", label: "PDF (A4 page)" },
                { value: "jpg", label: "JPG image" },
              ]}
            />
            {output === "pdf" ? (
              <Segmented<PrintSize>
                legend="Size on the page"
                value={printSize}
                onChange={setPrintSize}
                hint="Card size prints each side 8.56 × 5.4 cm, like the real card."
                options={[
                  { value: "card", label: "Card size" },
                  { value: "page", label: "Fit the page" },
                ]}
              />
            ) : null}
            <div>
              <FieldLabel htmlFor="front-back-kb">Max file size (KB)</FieldLabel>
              <input id="front-back-kb" inputMode="decimal" placeholder="Optional, e.g. 200" value={maxKBText} onChange={(e) => setMaxKBText(e.target.value)} aria-invalid={kbError} className={`${inputClass} mt-1.5`} />
            </div>
          </div>
          {kbError ? (
            <p className="text-sm font-medium text-danger-ink" role="alert">
              Enter a maximum of at least 10 KB, or leave it empty.
            </p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-ink">
              Preview <span className="font-normal text-muted">· {formatDimensions(preview.width, preview.height)}, saved as {label}{maxKB && !kbError ? ` up to ${maxKB} KB` : ""}</span>
            </p>
            <div
              className="relative mx-auto mt-2 max-h-80 overflow-hidden border border-line bg-white"
              style={{ aspectRatio: `${preview.width} / ${preview.height}`, maxWidth: `min(100%, calc(20rem * ${preview.width} / ${preview.height}))` }}
              role="img"
              aria-label={`Layout preview: front ${layout === "stacked" ? "above" : "beside"} the back`}
            >
              {[f, b].map((item, index) => {
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
            <Alert tone="error" title="The two sides couldn't be combined">
              {error.message}
            </Alert>
          ) : null}
          <ActionButton onClick={() => combine(f, b)} busy={runner.busy} busyLabel="Combining…" progress={runner.progress} disabled={kbError}>
            {current ? "Combine again" : "Combine front and back"}
          </ActionButton>
        </section>
      ) : null}

      {current && url ? (
        <section aria-labelledby="result-heading" className="rounded-lg border border-line bg-canvas shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2 id="result-heading" ref={resultHeading} tabIndex={-1} className="scroll-mt-24 text-lg font-bold text-ink outline-none">
                Front and back in one {current.output === "pdf" ? "page" : "image"}
              </h2>
              <p className="mt-0.5 text-sm text-muted" aria-live="polite">
                {current.output === "pdf" ? "PDF, one A4 page" : `JPG · ${formatDimensions(current.width, current.height)}`} · {formatBytes(current.blob.size)}
              </p>
            </div>
            <DownloadButton
              href={url}
              fileName={current.output === "pdf" ? "front-and-back.pdf" : `front-and-back-${current.width}x${current.height}.jpg`}
              label={`Download ${current.output === "pdf" ? "PDF" : "JPG"}`}
              tool={TOOL}
              outputFormat={current.output === "pdf" ? "PDF" : "JPG"}
            />
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            {current.overMax ? (
              <Alert tone="warning" title={`Couldn't get under ${maxKB} KB`}>
                The smallest file with both sides readable is {formatBytes(current.blob.size)}. Allow a larger file, or crop away the
                background around the card first.
              </Alert>
            ) : null}
            {current.output === "pdf" ? (
              <p className="text-sm text-muted">
                The PDF holds the image below on one A4 page{printSize === "card" ? ", each side at card size (8.56 × 5.4 cm) when printed at 100%" : ""}.
              </p>
            ) : null}
            {imageUrl ? (
              <ImagePreview src={imageUrl} alt={`Front and back side combined, ${formatDimensions(current.width, current.height)}`} width={current.width} height={current.height} className="h-64 sm:h-96" />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Slot({ label, image, onClear, clearLabel }: { label: string; image: SourceImage; onClear: () => void; clearLabel: string }) {
  return (
    <figure className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
      <img src={image.url} alt={`The ${label.toLowerCase()} side`} className="h-20 w-20 shrink-0 rounded border border-line bg-white object-contain" />
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
