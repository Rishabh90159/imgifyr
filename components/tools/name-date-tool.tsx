"use client";

import { useState } from "react";
import { ResultPanel, type ResultImage } from "@/components/before-after/result-panel";
import { ImageCropper } from "@/components/cropper/image-cropper";
import { OrientationControls } from "@/components/cropper/orientation-controls";
import { useCropState } from "@/components/cropper/use-crop";
import { Alert } from "@/components/controls/alert";
import { Checkbox, FieldLabel, inputClass, Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { formatPhotoDate, stripLayout, type DateFormat } from "@/lib/image-processing/caption";
import { newSourceId } from "@/lib/image-processing/client";
import { toImageToolError } from "@/lib/image-processing/errors";
import { FORMATS, RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import type { ImageTransform } from "@/lib/image-processing/types";
import { formatBytes, formatDimensions, KB, outputFileName, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

const TOOL = "add-name-and-date-on-photo" as const;

type Size = "kerala-psc" | "custom";

/** Kerala PSC: 150 × 200 px JPG, at most 30 KB, name and photo date printed at the bottom (keralapsc.gov.in notices). */
const KERALA_PSC = { width: 150, height: 200, maxKB: 30 };

const FONT = "Arial, Helvetica, sans-serif";

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface Spec {
  width: number;
  height: number;
  maxKB?: number;
}

/** Draws the cropped photo and the caption strip, returning a lossless PNG of the exact output size. */
async function compose(photo: Blob, spec: Spec, lines: string[]): Promise<Blob> {
  const { font, lineHeight, strip } = stripLayout(spec.height, lines.length);
  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, spec.width, spec.height);
  const bitmap = await createImageBitmap(photo);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const top = spec.height - strip + Math.round(font * 0.25);
  const maxWidth = spec.width - Math.max(4, Math.round(spec.width * 0.04));
  lines.forEach((line, index) => {
    // Long names shrink to fit the width instead of being cut off.
    let size = font;
    ctx.font = `bold ${size}px ${FONT}`;
    while (size > 8 && ctx.measureText(line).width > maxWidth) {
      size--;
      ctx.font = `bold ${size}px ${FONT}`;
    }
    ctx.fillText(line, spec.width / 2, top + index * lineHeight + lineHeight / 2, maxWidth);
  });
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("The photo couldn't be drawn in this browser.");
  return blob;
}

export function NameDateTool() {
  useToolOpen(TOOL);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const [size, setSize] = useState<Size>("kerala-psc");
  const [custom, setCustom] = useState({ width: "300", height: "400", maxKB: "" });
  const [name, setName] = useState("");
  const [showDate, setShowDate] = useState(true);
  const [date, setDate] = useState(todayIso);
  const [dateFormat, setDateFormat] = useState<DateFormat>("dd/mm/yyyy");
  const [result, setResult] = useState<{ key: string; image: ResultImage; spec: Spec; overMax: boolean } | null>(null);

  const lines = [name.trim(), showDate ? formatPhotoDate(date, dateFormat) : ""].filter(Boolean);
  const { spec, specError } = ((): { spec: Spec | null; specError: string | null } => {
    if (size === "kerala-psc") return { spec: KERALA_PSC, specError: null };
    const width = Number(custom.width.trim());
    const height = Number(custom.height.trim());
    const maxKB = custom.maxKB.trim() ? Number(custom.maxKB.trim()) : undefined;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 100 || height < 100 || width > 3000 || height > 3000) {
      return { spec: null, specError: "Enter a whole-number width and height between 100 and 3000 pixels." };
    }
    if (maxKB !== undefined && !(maxKB >= 5)) return { spec: null, specError: "Enter a maximum of at least 5 KB, or leave it empty." };
    return { spec: { width, height, maxKB }, specError: null };
  })();
  const layout = spec ? stripLayout(spec.height, Math.max(1, lines.length)) : null;
  const photoHeight = spec && layout ? spec.height - layout.strip : 1;
  const aspect = spec ? spec.width / photoHeight : 0.75;
  const cropState = useCropState(source, aspect);
  const dateMissing = showDate && !formatPhotoDate(date, dateFormat);
  const textError = dateMissing
    ? "Pick the date the photo was taken, or untick the date option."
    : lines.length === 0 ? "Type your name or keep the date switched on." : name.length > 60 ? "Use at most 60 characters for the name." : null;

  const key = source && spec ? JSON.stringify([source.id, cropState.transform, spec, lines]) : "";
  const current = result?.key === key ? result : null;

  const onFile = async (file: File) => {
    runner.cancel();
    const loaded = await select(file);
    if (loaded) setResult(null);
  };

  const reset = () => {
    runner.cancel();
    clear();
    setResult(null);
  };

  const run = async (image: SourceImage, target: Spec, transform: ImageTransform) => {
    if (textError) return;
    setError(null);
    track("processing_started", { tool: TOOL, preset: size });
    try {
      // 1. The cropped photo at exactly the space above the caption.
      const cropped = await runner.run({
        kind: "encode",
        sourceId: image.id,
        file: image.file,
        transform,
        width: target.width,
        height: photoHeight,
        mime: "image/png",
        background: "#ffffff",
      });
      if (!cropped) return;
      // 2. Photo plus caption, still lossless.
      const composed = await compose(cropped.blob, target, lines);
      // 3. One JPG compression, under the KB limit when there is one, at the exact pixel size.
      const base = { sourceId: newSourceId(), file: composed, noCache: true, width: target.width, height: target.height };
      let out: { blob: Blob; width: number; height: number };
      let overMax = false;
      if (target.maxKB) {
        const fitted = await runner.run({ ...base, kind: "target", sourceMime: "image/png", targetBytes: Math.floor(target.maxKB * KB), mime: "image/jpeg", allowResize: false, background: "#ffffff" });
        if (!fitted) return;
        out = fitted;
        overMax = fitted.outcome !== "met";
      } else {
        const encoded = await runner.run({ ...base, kind: "encode", mime: "image/jpeg", quality: 0.92, background: "#ffffff" });
        if (!encoded) return;
        out = encoded;
      }
      setResult({ key, image: { blob: out.blob, width: out.width, height: out.height, mime: "image/jpeg" }, spec: target, overMax });
      track("name_date_added", { tool: TOOL, preset: size, input_format: FORMATS[image.mime].label, outcome: overMax ? "over-max" : "met", size_bucket: sizeBucket(image.size) });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const controls = source ? (
    <>
      <Segmented<Size>
        legend="Photo size"
        value={size}
        onChange={setSize}
        hint={size === "kerala-psc" ? "Kerala PSC: 150 × 200 pixels, JPG, at most 30 KB, with name and date at the bottom." : undefined}
        options={[
          { value: "kerala-psc", label: "Kerala PSC" },
          { value: "custom", label: "Custom size" },
        ]}
      />
      {size === "custom" ? (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel htmlFor="nd-width">Width (px)</FieldLabel>
            <input id="nd-width" inputMode="numeric" value={custom.width} onChange={(e) => setCustom({ ...custom, width: e.target.value })} aria-invalid={Boolean(specError)} className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <FieldLabel htmlFor="nd-height">Height (px)</FieldLabel>
            <input id="nd-height" inputMode="numeric" value={custom.height} onChange={(e) => setCustom({ ...custom, height: e.target.value })} aria-invalid={Boolean(specError)} className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <FieldLabel htmlFor="nd-kb">Max KB</FieldLabel>
            <input id="nd-kb" inputMode="decimal" placeholder="Optional" value={custom.maxKB} onChange={(e) => setCustom({ ...custom, maxKB: e.target.value })} aria-invalid={Boolean(specError)} className={`${inputClass} mt-1.5`} />
          </div>
        </div>
      ) : null}
      {specError ? (
        <p className="text-sm font-medium text-danger-ink" role="alert">
          {specError}
        </p>
      ) : null}

      <div>
        <FieldLabel htmlFor="nd-name">Name</FieldLabel>
        <input id="nd-name" value={name} maxLength={80} autoComplete="name" placeholder="As on your application" onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-1.5`} />
      </div>
      <Checkbox checked={showDate} onChange={setShowDate}>
        Print the date the photo was taken
      </Checkbox>
      {showDate ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="nd-date">Photo date</FieldLabel>
            <input id="nd-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <FieldLabel htmlFor="nd-format">Date format</FieldLabel>
            <select id="nd-format" value={dateFormat} onChange={(e) => setDateFormat(e.target.value as DateFormat)} className={`${inputClass} mt-1.5`}>
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="dd-mm-yyyy">DD-MM-YYYY</option>
              <option value="dd.mm.yyyy">DD.MM.YYYY</option>
              <option value="dd mon yyyy">DD Mon YYYY</option>
            </select>
          </div>
        </div>
      ) : null}
      {textError && (name.length > 0 || dateMissing) ? (
        <p className="text-sm font-medium text-danger-ink" role="alert">
          {textError}
        </p>
      ) : null}

      <OrientationControls onRotate={cropState.rotate} onFlip={cropState.flip} flipped={cropState.flipH} />
      {spec && cropState.pixels.width < spec.width ? (
        <Alert tone="warning" title="The selected area is smaller than the output">
          Your selection is {cropState.pixels.width} pixels wide but the photo needs {spec.width}, so it will be enlarged and may look soft.
        </Alert>
      ) : null}
      <ActionButton onClick={() => spec && run(source, spec, cropState.transform)} busy={runner.busy} busyLabel="Adding name and date…" progress={runner.progress} disabled={!spec || Boolean(textError)}>
        {current ? "Create photo again" : "Add name and date"}
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
      prompt="Drop your photo"
      widePreview
      preview={
        source && spec && layout ? (
          <div className="mx-auto max-w-sm">
            <ImageCropper
              src={source.url}
              imageWidth={cropState.dims.width}
              imageHeight={cropState.dims.height}
              rotation={cropState.rotation}
              flipH={cropState.flipH}
              aspect={aspect}
              crop={cropState.crop}
              onChange={cropState.setCrop}
              guide="portrait"
              label="Photo crop area"
            />
            {/* The caption exactly as it will be drawn, scaled with the preview. */}
            <svg viewBox={`0 0 ${spec.width} ${layout.strip}`} className="block w-full border border-t-0 border-line bg-white" role="img" aria-label={`Caption preview: ${lines.join(", ") || "empty"}`}>
              {lines.map((line, index) => (
                <text
                  key={index}
                  x={spec.width / 2}
                  y={Math.round(layout.font * 0.25) + index * layout.lineHeight + layout.lineHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily={FONT}
                  fontWeight="bold"
                  fontSize={layout.font}
                  textLength={line.length * layout.font * 0.6 > spec.width * 0.96 ? spec.width * 0.96 : undefined}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {line}
                </text>
              ))}
            </svg>
          </div>
        ) : undefined
      }
      controls={controls}
      result={
        source && current ? (
          <ResultPanel
            tool={TOOL}
            heading="Your photo with name and date"
            original={source}
            output={current.image}
            fileName={outputFileName(source.name, `name-date-${current.spec.width}x${current.spec.height}`, "jpg")}
            downloadLabel="Download JPG"
            status={
              <>
                {current.overMax ? (
                  <Alert tone="warning" title={`Couldn't get under ${current.spec.maxKB} KB at this size`}>
                    The smallest file at {formatDimensions(current.spec.width, current.spec.height)} is {formatBytes(current.image.blob.size)}. A
                    plainer background compresses better.
                  </Alert>
                ) : (
                  <Alert tone="success" title={`${formatDimensions(current.spec.width, current.spec.height)} JPG, ${formatBytes(current.image.blob.size)}`}>
                    Check that the name and date are easy to read before you upload.
                  </Alert>
                )}
                <Alert tone="info" title="Check your notification">
                  Follow the photo rules in the notification you&apos;re applying under; they can differ from post to post.
                </Alert>
              </>
            }
          />
        ) : null
      }
    />
  );
}
