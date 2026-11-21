"use client";

import { useId, useState } from "react";
import { ResultPanel, type ResultImage } from "@/components/before-after/result-panel";
import { Alert } from "@/components/controls/alert";
import { Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { toImageToolError } from "@/lib/image-processing/errors";
import { fitPlacement } from "@/lib/image-processing/fit";
import { FORMATS, RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import type { PixelRect } from "@/lib/image-processing/types";
import type { ToolId } from "@/lib/tools/registry";
import { formatBytes, formatDimensions, outputFileName, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

/**
 * YouTube thumbnail maker. YouTube Help (answer 72431): 3840 × 2160 for videos (16:9) and 2160 × 3840 for Shorts (9:16),
 * at least 640 px wide (videos) or tall (Shorts), JPG or PNG, under 2 MB when uploading from a phone (50 MB from a
 * computer). Every file is kept under 2 MB, so it uploads from any device.
 */

const TOOL: ToolId = "youtube-thumbnail";
const MAX_BYTES = 2 * 1024 * 1024 - 16 * 1024;
const QUALITIES = [0.92, 0.86, 0.8, 0.72, 0.64, 0.55, 0.46];

type Kind = "video" | "shorts";
type Layout = "fit" | "fill";
type Fill = "blur" | "white" | "black" | "custom";

const SIZES: Record<Kind, { value: string; label: string; width: number; height: number }[]> = {
  video: [
    { value: "3840", label: "3840 × 2160 (recommended)", width: 3840, height: 2160 },
    { value: "1920", label: "1920 × 1080", width: 1920, height: 1080 },
    { value: "1280", label: "1280 × 720", width: 1280, height: 720 },
  ],
  shorts: [
    { value: "2160", label: "2160 × 3840 (recommended)", width: 2160, height: 3840 },
    { value: "1080", label: "1080 × 1920", width: 1080, height: 1920 },
  ],
};

/** Centre crop of the source with the target's shape (for "Fill the frame"). */
function centreCrop(w: number, h: number, aspect: number): PixelRect {
  if (w / h > aspect) {
    const cw = Math.round(h * aspect);
    return { x: Math.round((w - cw) / 2), y: 0, width: cw, height: h };
  }
  const ch = Math.round(w / aspect);
  return { x: 0, y: Math.round((h - ch) / 2), width: w, height: ch };
}

export function YoutubeThumbnailTool() {
  useToolOpen(TOOL);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const colorId = useId();
  const [kind, setKind] = useState<Kind>("video");
  const [sizeChoice, setSizeChoice] = useState<Record<Kind, string>>({ video: "3840", shorts: "2160" });
  const [layout, setLayout] = useState<Layout>("fit");
  const [fill, setFill] = useState<Fill>("blur");
  const [customColor, setCustomColor] = useState("#ff0033");
  const [result, setResult] = useState<{ key: string; image: ResultImage; quality: number } | null>(null);

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

  if (!source) {
    return (
      <ToolWorkspace accept={RASTER_INPUT_FORMATS} source={null} loading={loading} error={error} onFile={onFile} onReset={reset} prompt="Drop your image here" controls={null} />
    );
  }

  const size = SIZES[kind].find((s) => s.value === sizeChoice[kind]) ?? SIZES[kind][0];
  const W = size.width;
  const H = size.height;
  const fillColor = fill === "custom" ? customColor : fill === "black" ? "#000000" : "#ffffff";
  const placement = fitPlacement(source.width, source.height, { width: W, height: H, alignX: 0.5, alignY: 0.5, border: 0 });
  const crop = centreCrop(source.width, source.height, W / H);
  const shown = layout === "fit" ? placement : { x: 0, y: 0, width: W, height: H };
  const scaleUp = layout === "fit" ? placement.width / source.width : W / crop.width;
  const settingsKey = JSON.stringify([source.id, W, H, layout, layout === "fit" ? fill : null, fill === "custom" ? customColor : null]);
  const current = result?.key === settingsKey ? result : null;

  const run = async (image: SourceImage) => {
    setError(null);
    try {
      let made: { blob: Blob; width: number; height: number } | null = null;
      let used = QUALITIES[0];
      // Highest quality that stays under 2 MB.
      for (const quality of QUALITIES) {
        const encoded = await runner.run({
          kind: "encode",
          sourceId: image.id,
          file: image.file,
          width: W,
          height: H,
          mime: "image/jpeg",
          quality,
          background: fillColor,
          transform: layout === "fill" ? { rotate: 0, flipH: false, crop } : { rotate: 0, flipH: false },
          ...(layout === "fit" ? { fit: { placement, fill: fill === "blur" ? ("blur" as const) : ("color" as const) } } : {}),
        });
        if (!encoded) return;
        made = encoded;
        used = quality;
        if (encoded.blob.size <= MAX_BYTES) break;
      }
      if (!made) return;
      setResult({ key: settingsKey, image: { blob: made.blob, width: made.width, height: made.height, mime: "image/jpeg" }, quality: used });
      track("resize_completed", { tool: TOOL, input_format: FORMATS[image.mime].label, output_format: "JPG", size_bucket: sizeBucket(image.size), mode: `${kind}-${W}-${layout}` });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    }
  };

  const preview = (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div
        role="img"
        aria-label={`Preview of your ${W} × ${H} thumbnail`}
        className={`relative mx-auto w-full overflow-hidden rounded-md border border-line shadow-sm ${kind === "video" ? "max-w-[34rem]" : "max-w-[15rem]"}`}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {layout === "fit" ? (
          <>
            {fill === "blur" ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview
              <img src={source.url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
            ) : (
              <div className="absolute inset-0" style={{ background: fillColor }} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
            <img
              src={source.url}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ left: `${(shown.x / W) * 100}%`, top: `${(shown.y / H) * 100}%`, width: `${(shown.width / W) * 100}%`, height: `${(shown.height / H) * 100}%` }}
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- local preview
          <img src={source.url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {W} × {H} · {kind === "video" ? "16:9" : "9:16"}
      </p>
    </div>
  );

  const controls = (
    <>
      <Segmented<Kind>
        legend="Thumbnail for"
        value={kind}
        onChange={setKind}
        options={[
          { value: "video", label: "Video (16:9)" },
          { value: "shorts", label: "Shorts (9:16)" },
        ]}
      />
      <Segmented<string>
        legend="Size"
        value={size.value}
        onChange={(v) => setSizeChoice((s) => ({ ...s, [kind]: v }))}
        options={SIZES[kind].map((s) => ({ value: s.value, label: s.label }))}
      />
      <Segmented<Layout>
        legend="Your image"
        value={layout}
        onChange={setLayout}
        options={[
          { value: "fit", label: "Fit the whole image" },
          { value: "fill", label: "Fill the frame" },
        ]}
        hint={layout === "fit" ? "Nothing is cut off; the empty sides get a background." : "Fills the frame edge to edge; the centre is kept and the edges are trimmed."}
      />
      {layout === "fit" ? (
        <Segmented<Fill>
          legend="Background"
          value={fill}
          onChange={setFill}
          options={[
            { value: "blur", label: "Blurred image" },
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
            { value: "custom", label: "Colour" },
          ]}
        />
      ) : null}
      {layout === "fit" && fill === "custom" ? (
        <div className="flex items-center gap-3">
          <input id={colorId} type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-line-strong bg-canvas p-1" />
          <label htmlFor={colorId} className="text-sm text-ink">
            Background colour <span className="font-mono text-muted">{customColor.toUpperCase()}</span>
          </label>
        </div>
      ) : null}
      <p className="text-sm text-muted">
        Output: <span className="font-medium text-ink">{formatDimensions(W, H)} JPG under 2 MB</span>
        <span> (was {formatDimensions(source.width, source.height)})</span>
      </p>
      {scaleUp > 1.05 ? (
        <Alert tone="info" title="Your image will be enlarged">
          It is smaller than {W} × {H}, so it may look soft. Use a larger image, or pick a smaller size.
        </Alert>
      ) : null}
      <ActionButton onClick={() => run(source)} busy={runner.busy} busyLabel="Creating…">
        {current ? "Create again" : "Create thumbnail"}
      </ActionButton>
    </>
  );

  return (
    <ToolWorkspace
      accept={RASTER_INPUT_FORMATS}
      source={source}
      loading={loading}
      error={error}
      onFile={onFile}
      onReset={reset}
      prompt="Drop your image here"
      preview={preview}
      widePreview
      controls={controls}
      result={
        current ? (
          <ResultPanel
            tool={TOOL}
            heading="Your YouTube thumbnail"
            original={source}
            output={current.image}
            fileName={outputFileName(source.name, kind === "video" ? "youtube-thumbnail" : "shorts-thumbnail", "jpg")}
            downloadLabel={`Download thumbnail (${formatBytes(current.image.blob.size)})`}
            status={
              <ul className="divide-y divide-line rounded-md border border-line text-sm" aria-label="YouTube requirement check">
                <li className="px-4 py-2.5">
                  <span className="text-success-ink">✓</span> <span className="font-medium text-ink">Size:</span>{" "}
                  <span className="text-ink-soft">
                    {formatDimensions(current.image.width, current.image.height)}, {kind === "video" ? "16:9" : "9:16"}
                  </span>
                </li>
                <li className="px-4 py-2.5">
                  <span className={current.image.blob.size <= MAX_BYTES ? "text-success-ink" : "text-warning"}>{current.image.blob.size <= MAX_BYTES ? "✓" : "!"}</span>{" "}
                  <span className="font-medium text-ink">File size:</span>{" "}
                  <span className="text-ink-soft">{formatBytes(current.image.blob.size)}, under YouTube&apos;s 2 MB limit for phone uploads</span>
                </li>
                <li className="px-4 py-2.5">
                  <span className="text-success-ink">✓</span> <span className="font-medium text-ink">Format:</span> <span className="text-ink-soft">JPG</span>
                </li>
              </ul>
            }
          />
        ) : null
      }
    />
  );
}
