"use client";

import { useId, useState } from "react";
import { ResultPanel, type ResultImage } from "@/components/before-after/result-panel";
import { Alert } from "@/components/controls/alert";
import { Checkbox, Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { toImageToolError } from "@/lib/image-processing/errors";
import { circlePlacement, fitPlacement } from "@/lib/image-processing/fit";
import { FORMATS, RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { formatDimensions, outputFileName, sizeBucket } from "@/lib/utils/format";
import { useJobRunner, useObjectUrl, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import type { ToolId } from "@/lib/tools/registry";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

/**
 * Profile photo (DP) without crop, for WhatsApp, Instagram and Telegram: the whole photo is fitted into a square (each app crops profile photos to a square and
 * shows them as a circle), with a blurred, plain or coloured background around it. "Inside the circle" shrinks the
 * photo so even its corners stay visible in the round view. Uses the shared encoder's fit mode, so the preview and
 * the file match.
 */

/** The apps that show a square profile photo as a circle, each with its own page. */
export type DpApp = "WhatsApp" | "Instagram" | "Telegram";
const TOOLS = {
  WhatsApp: "whatsapp-dp-without-crop",
  Instagram: "instagram-dp-without-crop",
  Telegram: "telegram-dp-without-crop",
} as const satisfies Record<DpApp, ToolId>;
/** Sharp on every phone screen; the apps re-compress profile photos anyway. */
const SIDE = 1080;

type Fill = "blur" | "white" | "black" | "custom";
type FitShape = "square" | "circle";

const FILL_COLORS: Record<Exclude<Fill, "custom" | "blur">, string> = { white: "#ffffff", black: "#000000" };

export function WhatsappDpTool() {
  return <DpMakerTool app="WhatsApp" />;
}

export function DpMakerTool({ app }: { app: DpApp }) {
  const TOOL = TOOLS[app];
  useToolOpen(TOOL);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const runner = useJobRunner();
  const colorId = useId();
  const [fill, setFill] = useState<Fill>("blur");
  const [customColor, setCustomColor] = useState("#25d366");
  const [shape, setShape] = useState<FitShape>("square");
  const [showCircle, setShowCircle] = useState(true);
  const [result, setResult] = useState<{ key: string; image: ResultImage } | null>(null);
  const resultUrl = useObjectUrl(result?.image.blob ?? null);

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
      <ToolWorkspace
        accept={RASTER_INPUT_FORMATS}
        source={null}
        loading={loading}
        error={error}
        onFile={onFile}
        onReset={reset}
        prompt="Drop your photo here"
        controls={null}
      />
    );
  }

  // Photos load already upright (EXIF orientation applied); the whole photo is used, so no crop or rotation state.
  const rotated = { width: source.width, height: source.height };
  const placement =
    shape === "circle"
      ? circlePlacement(rotated.width, rotated.height, SIDE)
      : fitPlacement(rotated.width, rotated.height, { width: SIDE, height: SIDE, alignX: 0.5, alignY: 0.5, border: 0 });
  const fillColor = fill === "custom" ? customColor : fill === "blur" ? "#ffffff" : FILL_COLORS[fill];
  const transform = { rotate: 0 as const, flipH: false };
  const enlarges = placement.width > rotated.width * 1.02;
  const settingsKey = JSON.stringify([source.id, transform, placement, fill, fill === "custom" ? customColor : null]);
  const current = result?.key === settingsKey ? result.image : null;

  const run = async (image: SourceImage) => {
    setError(null);
    try {
      const encoded = await runner.run({
        kind: "encode",
        sourceId: image.id,
        file: image.file,
        width: SIDE,
        height: SIDE,
        mime: "image/jpeg",
        quality: 0.92,
        background: fillColor,
        transform,
        fit: { placement, fill: fill === "blur" ? "blur" : "color" },
      });
      if (!encoded) return;
      setResult({ key: settingsKey, image: { blob: encoded.blob, width: encoded.width, height: encoded.height, mime: "image/jpeg" } });
      track("resize_completed", {
        tool: TOOL,
        input_format: FORMATS[image.mime].label,
        output_format: "JPG",
        size_bucket: sizeBucket(image.size),
        mode: `${shape}-${fill}`,
      });
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
        aria-label={`Preview: your whole photo in a ${SIDE} × ${SIDE} square${showCircle ? ", with ${app}'s round view marked" : ""}`}
        className="relative mx-auto aspect-square w-full max-w-[26rem] overflow-hidden rounded-md border border-line shadow-sm"
      >
        {fill === "blur" ? (
          <img src={source.url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
        ) : (
          <div className="absolute inset-0" style={{ background: fillColor }} />
        )}
        <img
          src={source.url}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${(placement.x / SIDE) * 100}%`,
            top: `${(placement.y / SIDE) * 100}%`,
            width: `${(placement.width / SIDE) * 100}%`,
            height: `${(placement.height / SIDE) * 100}%`,
          }}
        />
        {/* Darkens what the app's round view hides; on the preview only, not in the file. */}
        {showCircle ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 100vmax rgba(0,0,0,0.45)" }} />
        ) : null}
      </div>
      <p className="mt-2 text-center text-xs text-muted">{showCircle ? `The shaded corners are hidden in ${app}'s round view.` : `${SIDE} × ${SIDE} square`}</p>
    </div>
  );

  const controls = (
    <>
      <Segmented<FitShape>
        legend="Fit the whole photo"
        value={shape}
        onChange={setShape}
        options={[
          { value: "square", label: "In the square" },
          { value: "circle", label: "Inside the circle" },
        ]}
        hint={
          shape === "square"
            ? "Largest photo; the round view may trim its corners."
            : "A little smaller, so nothing is trimmed even in the round view."
        }
      />
      <Segmented<Fill>
        legend="Background"
        value={fill}
        onChange={setFill}
        options={[
          { value: "blur", label: "Blurred photo" },
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
          { value: "custom", label: "Colour" },
        ]}
      />
      {fill === "custom" ? (
        <div className="flex items-center gap-3">
          <input id={colorId} type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-line-strong bg-canvas p-1" />
          <label htmlFor={colorId} className="text-sm text-ink">
            Background colour <span className="font-mono text-muted">{customColor.toUpperCase()}</span>
          </label>
        </div>
      ) : null}
      <Checkbox checked={showCircle} onChange={setShowCircle} description="Shown on the preview only; your image stays square.">
        Show {app}&apos;s round view
      </Checkbox>
      <p className="text-sm text-muted">
        Output: <span className="font-medium text-ink">{formatDimensions(SIDE, SIDE)} JPG</span>
        <span> (was {formatDimensions(source.width, source.height)})</span>
      </p>
      {enlarges ? (
        <Alert tone="info" title="Your photo will be enlarged">
          It is smaller than the square, so it may look a little soft. A higher-resolution photo gives a sharper DP.
        </Alert>
      ) : null}
      <ActionButton onClick={() => run(source)} busy={runner.busy} busyLabel="Creating…">
        {current ? "Create again" : "Create DP"}
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
      prompt="Drop your photo here"
      preview={preview}
      widePreview
      controls={controls}
      result={
        current ? (
          <ResultPanel
            tool={TOOL}
            heading="Your full-size DP"
            original={source}
            output={current}
            fileName={outputFileName(source.name, `${app.toLowerCase()}-dp`, "jpg")}
            downloadLabel="Download DP (JPG)"
            comparison={
              <figure className="mx-auto max-w-xs text-center">
                {resultUrl ? (
                  <img src={resultUrl} alt={`Your DP as ${app} shows it, ${formatDimensions(current.width, current.height)}`} className="mx-auto aspect-square w-full rounded-full border border-line object-cover" />
                ) : null}
                <figcaption className="mt-2 text-sm text-muted">As it appears in {app}</figcaption>
              </figure>
            }
          />
        ) : null
      }
    />
  );
}
