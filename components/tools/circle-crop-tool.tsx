"use client";

import { useId, useState } from "react";
import { ResultPanel, type ResultImage } from "@/components/before-after/result-panel";
import { ImageCropper } from "@/components/cropper/image-cropper";
import { OrientationControls } from "@/components/cropper/orientation-controls";
import { useCropState } from "@/components/cropper/use-crop";
import { Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { newSourceId } from "@/lib/image-processing/client";
import { toImageToolError } from "@/lib/image-processing/errors";
import { FORMATS, LIMITS, RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { outputFileName, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

const TOOL = "circle-crop" as const;

type SizeChoice = "crop" | "1000" | "500" | "200";
type BackgroundChoice = "transparent" | "white" | "custom";
type BorderChoice = "none" | "thin" | "thick";

/** Border width as a share of the circle's diameter, so it looks the same at every output size. */
const BORDER_SHARE: Record<Exclude<BorderChoice, "none">, number> = { thin: 0.015, thick: 0.04 };

interface Style {
  background: string | null;
  border: { width: number; color: string } | null;
}

/** Masks a square image to a circle with smooth edges, adds the border, and fills the corners if a background is set. */
async function makeRound(square: Blob, side: number, style: Style): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  const bitmap = await createImageBitmap(square);
  ctx.drawImage(bitmap, 0, 0, side, side);
  bitmap.close();
  const r = side / 2;
  // "destination-in" keeps the photo only where the circle is drawn, with anti-aliased edges.
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  if (style.border) {
    ctx.strokeStyle = style.border.color;
    ctx.lineWidth = style.border.width;
    ctx.beginPath();
    ctx.arc(r, r, r - style.border.width / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (style.background) {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, side, side);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new Error("The round image couldn't be drawn in this browser.");
  return blob;
}

export function CircleCropTool() {
  useToolOpen(TOOL);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const bgColorId = useId();
  const borderColorId = useId();
  const [size, setSize] = useState<SizeChoice>("crop");
  const [background, setBackground] = useState<BackgroundChoice>("transparent");
  const [customColor, setCustomColor] = useState("#f2f2f2");
  const [border, setBorder] = useState<BorderChoice>("none");
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [result, setResult] = useState<{ key: string; image: ResultImage } | null>(null);

  const cropState = useCropState(source, 1);
  const cropSide = Math.max(1, Math.min(cropState.pixels.width, cropState.pixels.height, LIMITS.maxOutputSide));
  const side = size === "crop" ? cropSide : Number(size);
  const fill = background === "transparent" ? null : background === "white" ? "#ffffff" : customColor;
  const style: Style = {
    background: fill,
    border: border === "none" ? null : { width: Math.max(1, Math.round(side * BORDER_SHARE[border])), color: borderColor },
  };
  const mime = fill ? "image/jpeg" : "image/png";
  const key = source ? JSON.stringify([source.id, cropState.transform, side, style]) : "";
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
    setSize("crop");
    setBackground("transparent");
    setBorder("none");
  };

  const run = async (image: SourceImage) => {
    setError(null);
    try {
      // 1. The square crop at the output size, lossless and keeping any transparency.
      const square = await runner.run({ kind: "encode", sourceId: image.id, file: image.file, transform: cropState.transform, width: side, height: side, mime: "image/png", background: null });
      if (!square) return;
      // 2. Round mask, border and background.
      const round = await makeRound(square.blob, side, style);
      // 3. A transparent result stays PNG; with a background colour, one JPG compression.
      let blob = round;
      if (fill) {
        const encoded = await runner.run({ kind: "encode", sourceId: newSourceId(), file: round, noCache: true, width: side, height: side, mime: "image/jpeg", quality: 0.92, background: fill });
        if (!encoded) return;
        blob = encoded.blob;
      }
      setResult({ key, image: { blob, width: side, height: side, mime } });
      track("circle_crop_completed", { tool: TOOL, input_format: FORMATS[image.mime].label, output_format: FORMATS[mime].label, mode: border === "none" ? background : `${background}-border`, size_bucket: sizeBucket(image.size) });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const colorInput = (id: string, value: string, onChange: (next: string) => void, label: string) => (
    <div className="flex items-center gap-3">
      <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-line-strong bg-canvas p-1" />
      <label htmlFor={id} className="text-sm text-ink">
        {label} <span className="font-mono text-muted">{value.toUpperCase()}</span>
      </label>
    </div>
  );

  const controls = source ? (
    <>
      <OrientationControls onRotate={cropState.rotate} onFlip={cropState.flip} flipped={cropState.flipH} />
      <Segmented<SizeChoice>
        legend="Size"
        value={size}
        onChange={setSize}
        hint={`The round image will be ${side.toLocaleString("en-US")} × ${side.toLocaleString("en-US")} pixels.`}
        options={[
          { value: "crop", label: "Keep crop size" },
          { value: "1000", label: "1000 px" },
          { value: "500", label: "500 px" },
          { value: "200", label: "200 px" },
        ]}
      />
      <Segmented<BackgroundChoice>
        legend="Corners"
        value={background}
        onChange={setBackground}
        hint={fill ? "Saved as JPG with the corners filled in, which suits forms and apps that don't accept PNG." : "Saved as PNG: everything outside the circle is see-through."}
        options={[
          { value: "transparent", label: "Transparent PNG" },
          { value: "white", label: "White JPG" },
          { value: "custom", label: "Colour JPG" },
        ]}
      />
      {background === "custom" ? colorInput(bgColorId, customColor, setCustomColor, "Corner colour") : null}
      <Segmented<BorderChoice>
        legend="Border"
        value={border}
        onChange={setBorder}
        options={[
          { value: "none", label: "None" },
          { value: "thin", label: "Thin" },
          { value: "thick", label: "Thick" },
        ]}
      />
      {border !== "none" ? colorInput(borderColorId, borderColor, setBorderColor, "Border colour") : null}
      <ActionButton onClick={() => run(source)} busy={runner.busy} busyLabel="Cropping to a circle…" progress={runner.progress}>
        {current ? "Crop again" : "Crop to circle"}
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
      prompt="Drop a photo or logo to crop into a circle"
      widePreview
      preview={
        source ? (
          <ImageCropper
            src={source.url}
            imageWidth={cropState.dims.width}
            imageHeight={cropState.dims.height}
            rotation={cropState.rotation}
            flipH={cropState.flipH}
            aspect={1}
            crop={cropState.crop}
            onChange={cropState.setCrop}
            guide="circle"
            label="Circle crop area"
          />
        ) : undefined
      }
      controls={controls}
      result={
        source && current ? (
          <ResultPanel
            tool={TOOL}
            heading="Your round image is ready"
            original={source}
            output={current.image}
            fileName={outputFileName(source.name, "circle", FORMATS[mime].extension)}
            downloadLabel={`Download ${FORMATS[mime].label}`}
          />
        ) : null
      }
    />
  );
}
