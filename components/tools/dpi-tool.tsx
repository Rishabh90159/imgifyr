"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ResultPanel, type ResultImage } from "@/components/before-after/result-panel";
import { Alert } from "@/components/controls/alert";
import { FieldLabel, inputClass, Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { printSize, readImageDpi, setImageDpi, type DpiInfo } from "@/lib/image-processing/dpi";
import { toImageToolError } from "@/lib/image-processing/errors";
import { FORMATS, RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { outputFileName, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

const TOOL = "change-image-dpi" as const;

type Choice = "72" | "96" | "150" | "200" | "300" | "600" | "custom";

function sizeText(width: number, height: number, dpi: number): string {
  const w = printSize(width, dpi);
  const h = printSize(height, dpi);
  return `${w.cm.toFixed(2)} × ${h.cm.toFixed(2)} cm (${w.inches.toFixed(2)} × ${h.inches.toFixed(2)} in)`;
}

const SOURCE_LABEL: Record<NonNullable<DpiInfo["source"]>, string> = {
  exif: "EXIF",
  jfif: "JFIF header",
  png: "PNG pHYs chunk",
};

export function DpiTool() {
  useToolOpen(TOOL);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const latestId = useRef<string | null>(null);
  const [stored, setStored] = useState<{ id: string; info: DpiInfo } | null>(null);
  const [choice, setChoice] = useState<Choice>("300");
  const [customDpi, setCustomDpi] = useState("300");
  const [result, setResult] = useState<{ key: string; image: ResultImage; dpi: number } | null>(null);

  const dpi = choice === "custom" ? Number(customDpi.trim()) : Number(choice);
  const dpiValid = Number.isInteger(dpi) && dpi >= 1 && dpi <= 9999;
  const current = source && stored?.id === source.id ? stored.info : null;
  // JPG and PNG keep their bytes; other formats can't hold a DPI value and are saved as JPG.
  const lossless = source ? source.mime === "image/jpeg" || source.mime === "image/png" : true;
  const key = source ? JSON.stringify([source.id, dpi]) : "";
  const done = result?.key === key ? result : null;

  const onFile = async (file: File) => {
    runner.cancel();
    const loaded = await select(file);
    if (!loaded) return;
    latestId.current = loaded.id;
    setResult(null);
    const bytes = new Uint8Array(await loaded.file.arrayBuffer());
    // A newer file may have been dropped while this one was read.
    if (latestId.current === loaded.id) setStored({ id: loaded.id, info: readImageDpi(bytes) });
  };

  const reset = () => {
    runner.cancel();
    clear();
    setResult(null);
    setStored(null);
  };

  const apply = async (image: SourceImage) => {
    if (!dpiValid) return;
    setError(null);
    track("processing_started", { tool: TOOL, mode: lossless ? "header" : "convert" });
    try {
      let blob: Blob;
      if (lossless) {
        blob = new Blob([setImageDpi(new Uint8Array(await image.file.arrayBuffer()), dpi) as Uint8Array<ArrayBuffer>], { type: image.mime });
      } else {
        const encoded = await runner.run({
          kind: "encode",
          sourceId: image.id,
          file: image.file,
          width: image.width,
          height: image.height,
          mime: "image/jpeg",
          quality: 0.92,
          background: "#ffffff",
          dpi,
        });
        if (!encoded) return;
        blob = encoded.blob;
      }
      const mime = lossless ? image.mime : "image/jpeg";
      setResult({ key, image: { blob, width: image.width, height: image.height, mime }, dpi });
      track("dpi_changed", { tool: TOOL, input_format: FORMATS[image.mime].label, output_format: FORMATS[mime].label, preset: String(dpi), size_bucket: sizeBucket(image.size) });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const controls = source ? (
    <>
      <div className="rounded-md border border-line bg-surface px-4 py-3 text-sm" aria-live="polite">
        <p className="font-semibold text-ink">
          Current DPI:{" "}
          {current === null ? "checking…" : current.dpi ? `${current.dpi} DPI` : "not set"}
          {current?.source ? <span className="font-normal text-muted"> (from the {SOURCE_LABEL[current.source]})</span> : null}
        </p>
        <p className="mt-1 text-muted">
          {current?.dpi
            ? `Prints at ${sizeText(source.width, source.height, current.dpi)}.`
            : current
              ? "The file doesn't record a resolution, so most apps assume 72 or 96 DPI."
              : null}
        </p>
      </div>

      <Segmented<Choice>
        legend="New DPI"
        value={choice}
        onChange={setChoice}
        options={[
          { value: "72", label: "72" },
          { value: "96", label: "96" },
          { value: "150", label: "150" },
          { value: "200", label: "200" },
          { value: "300", label: "300" },
          { value: "600", label: "600" },
          { value: "custom", label: "Other" },
        ]}
      />
      {choice === "custom" ? (
        <div>
          <FieldLabel htmlFor="dpi-custom">DPI (1–9999)</FieldLabel>
          <input
            id="dpi-custom"
            inputMode="numeric"
            value={customDpi}
            onChange={(event) => setCustomDpi(event.target.value)}
            aria-invalid={!dpiValid}
            className={`${inputClass} mt-1.5 max-w-[10rem]`}
          />
        </div>
      ) : null}

      {dpiValid ? (
        <p className="text-sm text-ink">
          At {dpi} DPI, {source.width} × {source.height} px prints at <strong>{sizeText(source.width, source.height, dpi)}</strong>.
        </p>
      ) : (
        <p className="text-sm font-medium text-danger-ink" role="alert">
          Enter a whole number between 1 and 9999.
        </p>
      )}

      {lossless ? (
        <p className="text-xs text-muted">
          Only the DPI value changes: the pixels, quality and dimensions stay exactly the same. To make the picture a set size in
          centimetres, use <Link href="/tools/resize-image-in-cm" className="text-accent underline">resize image in cm</Link>.
        </p>
      ) : (
        <Alert tone="info" title={`${FORMATS[source.mime].label} files can't store a DPI value`}>
          The image will be saved as a high-quality JPG with the new DPI, at the same pixel size.
        </Alert>
      )}

      <ActionButton onClick={() => apply(source)} busy={runner.busy} busyLabel="Saving…" progress={runner.progress} disabled={!dpiValid}>
        {done ? "Change DPI again" : `Change to ${dpiValid ? dpi : "…"} DPI`}
      </ActionButton>
    </>
  ) : null;

  return (
    <ToolWorkspace
      accept={RASTER_INPUT_FORMATS}
      source={source}
      loading={loading}
      error={error}
      onFile={onFile}
      onReset={reset}
      prompt="Drop an image to check or change its DPI"
      controls={controls}
      result={
        source && done ? (
          <ResultPanel
            tool={TOOL}
            heading={`Saved at ${done.dpi} DPI`}
            original={source}
            output={done.image}
            fileName={outputFileName(source.name, `${done.dpi}dpi`, FORMATS[done.image.mime].extension)}
            downloadLabel={`Download ${FORMATS[done.image.mime].label}`}
            growthExpected
            extraRows={[
              { label: "DPI", before: current?.dpi ? String(current.dpi) : "not set", after: String(done.dpi) },
              { label: "Print size", before: current?.dpi ? sizeText(source.width, source.height, current.dpi) : "—", after: sizeText(source.width, source.height, done.dpi) },
            ]}
            status={
              <Alert tone="success" title={`${done.dpi} DPI, ${source.width} × ${source.height} px`}>
                {lossless
                  ? "Same pixels and quality as your original; only the stored resolution changed."
                  : "Saved as JPG at the same pixel size, with the new resolution recorded."}
              </Alert>
            }
          />
        ) : null
      }
    />
  );
}
