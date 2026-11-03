"use client";

import { lazy, Suspense, useEffect, useId, useState } from "react";
import { ResultPanel } from "@/components/before-after/result-panel";
import { Alert } from "@/components/controls/alert";
import { Checkbox, FieldLabel, inputClass, QualitySlider, Segmented } from "@/components/controls/fields";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { toImageToolError } from "@/lib/image-processing/errors";
import { ALL_INPUT_FORMATS, FORMATS, LIMITS } from "@/lib/image-processing/formats";
import { QUALITY } from "@/lib/image-processing/target-size";
import type { ToolId } from "@/lib/tools/registry";
import { formatBytes, formatDimensions, formatExactBytes, KB, MB, outputFileName, percentSaved, sizeBucket } from "@/lib/utils/format";
import { useEncodeSupport, useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { MAX_BATCH, reduceToTarget, type TargetOutput, type TargetSettings } from "./target-size-shared";
import { ActionButton, ToolWorkspace } from "./tool-workspace";

// Batch mode is only needed when several photos are chosen, so its code downloads only then.
const TargetSizeBatch = lazy(() => import("./target-size-batch").then((module) => ({ default: module.TargetSizeBatch })));

const DEFAULT_PRESETS_KB = [20, 50, 100, 200, 500];
const MIN_TARGET_BYTES = 2 * KB;
const MAX_TARGET_BYTES = 20 * MB;

type Unit = "KB" | "MB";
type OutputMime = TargetSettings["format"];

/** Optional minimum in KB, for forms with a range such as 20–50 KB. */
function parseMinimum(value: string, targetBytes: number | null): { bytes: number | null; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) return { bytes: null, error: null };
  const kb = Number(trimmed);
  if (!Number.isFinite(kb) || kb <= 0) return { bytes: null, error: "Enter the minimum as a number of KB, such as 20, or leave it empty." };
  const bytes = Math.ceil(kb * KB);
  if (targetBytes && bytes >= targetBytes) return { bytes: null, error: "The minimum must be smaller than the target." };
  return { bytes, error: null };
}

export interface TargetSizeToolProps {
  /** Which page the tool is on, for analytics and file naming. */
  tool?: ToolId;
  /** Target selected when the page opens, in KB. */
  defaultTargetKB?: number;
  /** Quick-pick targets in KB. */
  presetsKB?: number[];
  /** Read ?target= from the URL (only the generic exact-KB page uses this). */
  readTargetFromUrl?: boolean;
  /**
   * Single-purpose pages (20KB, 50KB…): start as soon as a photo is chosen, with the settings folded away
   * behind "Change settings", since the page already says what the target is.
   */
  quickStart?: boolean;
  /** Analytics events for a dedicated size page (e.g. the 20KB photo page). */
  events?: { started: AnalyticsEvent; completed: AnalyticsEvent; downloaded?: AnalyticsEvent };
}

function parseTarget(preset: string, custom: string, unit: Unit): { bytes: number | null; error: string | null } {
  if (preset !== "custom") return { bytes: Number(preset) * KB, error: null };
  const trimmed = custom.trim();
  if (!trimmed) return { bytes: null, error: "Enter a target size." };
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return { bytes: null, error: "Enter a positive number, such as 75." };
  const bytes = Math.floor(value * (unit === "MB" ? MB : KB));
  if (bytes < MIN_TARGET_BYTES) return { bytes: null, error: "The smallest target is 2 KB." };
  if (bytes > MAX_TARGET_BYTES) return { bytes: null, error: "The largest target is 20 MB." };
  return { bytes, error: null };
}

/**
 * Reduce an image to a target file size with the shared exact-KB engine.
 * Used by the generic "Resize Image to KB" page and by each dedicated size page
 * (20KB, 50KB, 100KB, 200KB), which preselect their own target. Choosing several
 * photos at once (up to MAX_BATCH) switches to batch mode with the same settings.
 */
export function TargetSizeTool({
  tool = "resize-image-to-kb",
  defaultTargetKB = 100,
  presetsKB = DEFAULT_PRESETS_KB,
  readTargetFromUrl = false,
  quickStart = false,
  events,
}: TargetSizeToolProps) {
  useToolOpen(tool);
  const { source, loading, error, select, clear, setError } = useSourceImage({ tool, accept: ALL_INPUT_FORMATS });
  const runner = useJobRunner();
  const webpSupported = useEncodeSupport("image/webp");
  const optionsId = useId();

  const initialPreset = presetsKB.includes(defaultTargetKB) ? String(defaultTargetKB) : "custom";
  const [preset, setPreset] = useState<string>(initialPreset);
  const [custom, setCustom] = useState(initialPreset === "custom" ? String(defaultTargetKB) : "");
  const [unit, setUnit] = useState<Unit>("KB");
  const [minimum, setMinimum] = useState("");
  const [format, setFormat] = useState<OutputMime>("image/jpeg");
  const [allowResize, setAllowResize] = useState(true);
  const [maxWidth, setMaxWidth] = useState("");
  const [qualityCap, setQualityCap] = useState<number>(QUALITY.max);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [state, setState] = useState<(TargetOutput & { key: string; settings: TargetSettings }) | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null);

  // Links such as /tools/resize-image-to-kb?target=50 preselect a size.
  useEffect(() => {
    if (!readTargetFromUrl) return;
    const params = new URLSearchParams(window.location.search);
    const requestedMin = Number(params.get("min"));
    if (Number.isFinite(requestedMin) && requestedMin > 0) setMinimum(String(requestedMin));
    const requested = Number(params.get("target"));
    if (!Number.isFinite(requested) || requested <= 0) return;
    if (presetsKB.includes(requested)) {
      setPreset(String(requested));
    } else if (requested >= 2 && requested <= 20 * 1024) {
      setPreset("custom");
      setCustom(String(requested));
      setUnit("KB");
    }
  }, [readTargetFromUrl, presetsKB]);

  const target = parseTarget(preset, custom, unit);
  const min = parseMinimum(minimum, target.bytes);
  // Padding up to a minimum works on JPG files only.
  const minBytes = format === "image/jpeg" ? min.bytes : null;

  // Optional maximum width: the image is scaled down to it first, then the size search runs.
  const maxWidthValue = maxWidth.trim() ? Number(maxWidth.trim()) : null;
  const widthError =
    maxWidthValue !== null && (!Number.isInteger(maxWidthValue) || maxWidthValue < 16 || maxWidthValue > LIMITS.maxOutputSide)
      ? `Enter a whole number of pixels between 16 and ${LIMITS.maxOutputSide.toLocaleString("en-US")}, or leave it empty.`
      : null;
  const exact =
    source && maxWidthValue && !widthError && maxWidthValue < source.width
      ? { width: maxWidthValue, height: Math.max(1, Math.round((maxWidthValue * source.height) / source.width)) }
      : null;
  const customQuality = qualityCap < QUALITY.max - 0.001;

  const settingsError = target.error ?? widthError ?? min.error;
  const settings: TargetSettings | null =
    target.bytes && !settingsError
      ? { targetBytes: target.bytes, minBytes, format, allowResize, maxWidth: maxWidthValue, maxQuality: customQuality ? qualityCap : null }
      : null;
  const settingsKey = JSON.stringify(settings);
  const keyFor = (image: SourceImage) => `${image.id}|${settingsKey}`;
  const current = source && state && state.key === keyFor(source) ? state : null;

  const run = async (image: SourceImage) => {
    if (!settings) return;
    setError(null);
    try {
      const output = await reduceToTarget(runner.run, image, settings);
      if (!output) return;
      setState({ ...output, key: keyFor(image), settings });
      track(events?.completed ?? "resize_completed", {
        tool,
        input_format: FORMATS[image.mime].label,
        output_format: FORMATS[output.image.mime].label,
        size_bucket: sizeBucket(image.size),
        target_kb: preset === "custom" ? undefined : Number(preset),
        outcome: output.result.usedOriginal ? "already_under" : output.result.outcome,
      });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool, error_code: normalized.code });
    }
  };

  const onFile = async (file: File) => {
    runner.cancel();
    const loaded = await select(file);
    if (!loaded) return;
    setState(null);
    if (events) track(events.started, { tool, input_format: FORMATS[loaded.mime].label, size_bucket: sizeBucket(loaded.size) });
    // The page already names the target: go straight to the result.
    if (quickStart) await run(loaded);
  };

  const onFiles = (files: File[]) => {
    if (files.length <= 1) {
      if (files[0]) void onFile(files[0]);
      return;
    }
    runner.cancel();
    clear();
    setState(null);
    setBatchFiles(files);
  };

  const reset = () => {
    runner.cancel();
    clear();
    setState(null);
    setBatchFiles(null);
    setMaxWidth("");
    setQualityCap(QUALITY.max);
    setOptionsOpen(false);
    setSettingsOpen(false);
  };

  const targetLabel = target.bytes ? formatBytes(target.bytes) : "";
  const summary = settings
    ? [
        minBytes ? `${formatBytes(minBytes)}–${targetLabel}` : `${targetLabel} or less`,
        FORMATS[format].label,
        allowResize ? "may reduce dimensions" : "keeps dimensions",
      ].join(" · ")
    : "one setting needs fixing (shown below)";

  const settingsFields = (
    <>
      <Segmented<string>
        legend="Target file size"
        value={preset}
        onChange={setPreset}
        options={[...presetsKB.map((kb) => ({ value: String(kb), label: `${kb} KB` })), { value: "custom", label: "Custom" }]}
      />

      {preset === "custom" ? (
        <div className="flex max-w-xs items-end gap-2">
          <div className="flex-1">
            <FieldLabel htmlFor="target-custom">Custom size</FieldLabel>
            <input
              id="target-custom"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 75"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              aria-invalid={Boolean(target.error)}
              aria-describedby="target-custom-help"
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="target-unit" className="sr-only">
              Unit
            </label>
            <select
              id="target-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as Unit)}
              className={`${inputClass} w-24`}
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
          </div>
        </div>
      ) : null}
      <p id="target-custom-help" className={`text-sm ${target.error ? "font-medium text-danger-ink" : "text-muted"}`}>
        {target.error ??
          `Target: ${targetLabel} or less (${formatExactBytes(target.bytes ?? 0)}). Sizes use 1 KB = 1,024 bytes.`}
      </p>

      <div className="max-w-[14rem]">
        <FieldLabel htmlFor="target-minimum">Minimum size (KB, optional)</FieldLabel>
        <input
          id="target-minimum"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 20"
          value={minimum}
          onChange={(event) => setMinimum(event.target.value)}
          aria-invalid={Boolean(min.error)}
          aria-describedby="target-minimum-help"
          disabled={format !== "image/jpeg"}
          className={`${inputClass} mt-1.5`}
        />
      </div>
      <p id="target-minimum-help" className={`-mt-2 text-sm ${min.error ? "font-medium text-danger-ink" : "text-muted"}`}>
        {format !== "image/jpeg"
          ? "A minimum size works with JPG output only."
          : (min.error ??
            (minBytes && target.bytes
              ? `The file will be between ${formatBytes(minBytes)} and ${formatBytes(target.bytes)}.`
              : "For forms with a range, such as 20–50 KB. Leave empty if there's no minimum."))}
      </p>

      <Segmented<OutputMime>
        legend="Output format"
        value={format}
        onChange={setFormat}
        options={[
          { value: "image/jpeg", label: "JPG" },
          { value: "image/webp", label: "WebP", disabled: webpSupported === false },
        ]}
        hint="JPG is accepted almost everywhere, including most application forms."
      />

      <Checkbox
        checked={allowResize}
        onChange={setAllowResize}
        description="If quality alone can't reach the target, shrink the dimensions too. Recommended: a smaller sharp image looks better than a heavily compressed one."
      >
        Allow smaller dimensions
      </Checkbox>

      <details
        className="group rounded-md border border-line"
        open={optionsOpen}
        onToggle={(event) => setOptionsOpen(event.currentTarget.open)}
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
          More options: width and quality
          <Chevron />
        </summary>
        <div className="space-y-5 border-t border-line px-4 py-4">
          <div className="max-w-[14rem]">
            <FieldLabel htmlFor={`${optionsId}-width`}>Maximum width (px)</FieldLabel>
            <input
              id={`${optionsId}-width`}
              inputMode="numeric"
              autoComplete="off"
              placeholder={source ? `Optional, now ${source.width}` : "Optional"}
              value={maxWidth}
              onChange={(event) => setMaxWidth(event.target.value)}
              aria-invalid={Boolean(widthError)}
              aria-describedby={`${optionsId}-width-help`}
              className={`${inputClass} mt-1.5`}
            />
            <p id={`${optionsId}-width-help`} className={`mt-1.5 text-xs ${widthError ? "font-medium text-danger-ink" : "text-muted"}`}>
              {widthError ??
                (exact
                  ? `Starts from ${formatDimensions(exact.width, exact.height)}.`
                  : "Scale down to this width first. Wider than the image? It's left as is.")}
            </p>
          </div>
          <QualitySlider
            label="Highest quality allowed"
            value={qualityCap}
            onChange={setQualityCap}
            min={0.3}
            max={QUALITY.max}
            hint={
              customQuality
                ? "The tool won't go above this quality, so the file may end up well under the target."
                : "Automatic: the tool uses the highest quality that fits the target."
            }
          />
        </div>
      </details>
    </>
  );

  // Single-purpose pages show one summary line; the full settings open on request.
  const settingsBlock = quickStart ? (
    <details className="group rounded-md border border-line" open={settingsOpen} onToggle={(event) => setSettingsOpen(event.currentTarget.open)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="font-medium text-ink">Settings: </span>
          <span className={settings ? "text-ink-soft" : "font-medium text-danger-ink"}>{summary}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-medium text-accent">
          Change settings
          <Chevron />
        </span>
      </summary>
      <div className="space-y-5 border-t border-line px-4 py-4">{settingsFields}</div>
    </details>
  ) : (
    settingsFields
  );

  if (batchFiles) {
    return (
      <Suspense fallback={<p className="rounded-lg border border-line bg-canvas p-5 text-sm text-muted">Preparing your photos…</p>}>
        <TargetSizeBatch
          tool={tool}
          files={batchFiles}
          settings={settings}
          settingsKey={settingsKey}
          settingsPanel={settingsBlock}
          onReset={reset}
        />
      </Suspense>
    );
  }

  const controls = source ? (
    <>
      {settingsBlock}

      {source.hasTransparency && format === "image/jpeg" ? (
        <Alert tone="info" title="Transparent areas will become white">
          JPG doesn&apos;t support transparency. Choose WebP to keep it.
        </Alert>
      ) : null}

      {/* With quick start the result is made automatically; the button returns when the settings change. */}
      {!quickStart || !current || runner.busy ? (
        <ActionButton
          onClick={() => run(source)}
          busy={runner.busy}
          busyLabel="Finding the best quality…"
          progress={runner.progress}
          disabled={Boolean(settingsError)}
        >
          {target.bytes ? `Resize to ${targetLabel}` : "Resize image"}
        </ActionButton>
      ) : null}
    </>
  ) : null;

  return (
    <ToolWorkspace
      accept={ALL_INPUT_FORMATS}
      source={source}
      loading={loading}
      error={error}
      onFile={onFile}
      onFiles={onFiles}
      maxFiles={MAX_BATCH}
      onReset={reset}
      prompt={target.bytes && preset !== "custom" ? `Drop an image to reduce to ${targetLabel}` : "Drop an image to resize to a file size"}
      controls={controls}
      result={source && current ? <TargetResultView tool={tool} source={source} state={current} downloadEvent={events?.downloaded} /> : null}
    />
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="transition-transform group-open:rotate-180">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TargetResultView({
  tool,
  source,
  state,
  downloadEvent,
}: {
  tool: ToolId;
  source: SourceImage;
  state: TargetOutput & { settings: TargetSettings };
  downloadEvent?: AnalyticsEvent;
}) {
  const { result, image, paddedBytes, settings } = state;
  const { targetBytes, minBytes } = settings;
  const size = image.blob.size;
  const met = size <= targetBytes && (!minBytes || size >= minBytes);
  const range = minBytes ? `${formatBytes(minBytes)}–${formatBytes(targetBytes)}` : null;
  const resized = image.width !== source.width || image.height !== source.height;
  const saved = percentSaved(source.size, size);

  let message: React.ReactNode;
  if (paddedBytes > 0 && met) {
    message = (
      <Alert tone="success" title={`${formatBytes(size)}, within your ${range} range`}>
        The compressed file was below {formatBytes(minBytes ?? 0)}, so {formatBytes(paddedBytes)} of padding was added: data that
        image viewers and upload forms ignore. The picture is exactly the same.
      </Alert>
    );
  } else if (result.usedOriginal) {
    message = (
      <Alert tone="success" title="Already under your target">
        Your image is {formatBytes(size)}, which is within {formatBytes(targetBytes)}, so no changes were needed. The download is
        your original file, unchanged.
      </Alert>
    );
  } else if (met) {
    message = (
      <>
        <Alert tone="success" title={`${formatBytes(size)} — within your ${formatBytes(targetBytes)} target`}>
          Saved at {Math.round((result.quality ?? 0) * 100)}% quality
          {resized ? `, resized to ${formatDimensions(image.width, image.height)}` : " at the original dimensions"}.
        </Alert>
        {resized ? (
          <Alert tone="info" title="Dimensions were reduced">
            {formatDimensions(source.width, source.height)} → {formatDimensions(image.width, image.height)}. Quality alone
            couldn&apos;t reach {formatBytes(targetBytes)} without visible blockiness, or you set a maximum width. If you need the
            original dimensions, turn off &ldquo;Allow smaller dimensions&rdquo; or choose a larger target.
          </Alert>
        ) : null}
      </>
    );
  } else {
    message = (
      <Alert tone="warning" title={`Closest achievable size: ${formatBytes(size)}`}>
        {result.outcome === "needs-resize"
          ? `At ${formatDimensions(image.width, image.height)}, this image can't get below ${formatBytes(size)}, even at the lowest quality. Turn on "Allow smaller dimensions" to reach ${formatBytes(targetBytes)}.`
          : `${formatBytes(targetBytes)} is smaller than this image can go, even at tiny dimensions and the lowest quality. Every image file has a minimum size for its headers and colour data. Try a larger target.`}
      </Alert>
    );
  }

  const stats = [
    { label: "Original size", value: formatBytes(source.size) },
    { label: "Target", value: range ?? `≤ ${formatBytes(targetBytes)}` },
    { label: "Result", value: formatBytes(size), emphasis: true },
    { label: "Saved", value: saved > 0.05 ? `${saved.toFixed(1)}%` : "—" },
  ];

  return (
    <ResultPanel
      tool={tool}
      heading={met ? "Your image is ready" : "Closest result"}
      original={source}
      output={image}
      fileName={outputFileName(source.name, `${Math.ceil(size / KB)}kb`, FORMATS[image.mime].extension)}
      downloadLabel={`Download ${FORMATS[image.mime].label} (${formatBytes(size)})`}
      downloadEvent={downloadEvent}
      extraRows={[
        { label: "Quality", before: "—", after: result.quality === null ? "Unchanged" : `${Math.round(result.quality * 100)}%` },
      ]}
      status={
        <>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-canvas px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</dt>
                <dd className={`mt-1 tabular-nums ${stat.emphasis ? "text-lg font-semibold text-ink" : "text-base text-ink"}`}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          {message}
        </>
      }
    />
  );
}
