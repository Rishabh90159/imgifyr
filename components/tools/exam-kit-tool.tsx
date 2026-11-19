"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { inputClass } from "@/components/controls/fields";
import { ImageCropper } from "@/components/cropper/image-cropper";
import { OrientationControls } from "@/components/cropper/orientation-controls";
import { useCropState } from "@/components/cropper/use-crop";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { handOffFiles } from "@/lib/handoff";
import { toImageToolError, type ImageToolError } from "@/lib/image-processing/errors";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { deriveCrop, KIT_GROUPS, shortNoticeName, specAspect, type KitExam, type KitSet } from "@/lib/requirements/kit";
import { formatKbRange, type ImageSpec } from "@/lib/requirements/types";
import type { ToolId } from "@/lib/tools/registry";
import { formatBytes } from "@/lib/utils/format";
import { useJobRunner, useSourceImage, useToolOpen, type SourceImage } from "./hooks";
import { growToMinimum, runSpec, type OutputSpec } from "./spec-runner";

const TOOL: ToolId = "all-exam-photo-signature";
/** Head-and-shoulders framing; every form's own shape is cut around it. */
const PHOTO_FRAME = 3.5 / 4.5;
const SIGNATURE_CLEANUP = { threshold: 190, to: "white" as const };

type Kind = "photo" | "signature";

interface KitFile {
  key: string;
  exam: KitExam;
  set: KitSet;
  kind: Kind;
  spec: ImageSpec;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  ok: boolean;
  notes: string[];
  zipName: string;
  downloadName: string;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function pixelsOk(spec: ImageSpec, width: number, height: number, grown: boolean): boolean {
  if (!spec.widthPx || !spec.heightPx || grown) return true;
  if (spec.pixelBasis === "minimum") return width >= spec.widthPx && height >= spec.heightPx;
  return width === spec.widthPx && height === spec.heightPx;
}

export function ExamKitTool({ exams }: { exams: KitExam[] }) {
  useToolOpen(TOOL);
  const router = useRouter();
  const photo = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const signature = useSourceImage({ tool: TOOL, accept: RASTER_INPUT_FORMATS });
  const photoCrop = useCropState(photo.source, PHOTO_FRAME);
  const signatureCrop = useCropState(signature.source, null);
  const runner = useJobRunner();

  /** Ticked exams, each with the notice chosen for it. */
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [cleanSignature, setCleanSignature] = useState(true);
  const [files, setFiles] = useState<{ key: string; list: KitFile[] } | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<ImageToolError | null>(null);
  const [zipping, setZipping] = useState(false);
  const urls = useRef<string[]>([]);

  const revokeAll = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
  };
  useEffect(() => revokeAll, []);

  const jobs = useMemo(() => {
    const list: { exam: KitExam; set: KitSet; kind: Kind; spec: ImageSpec }[] = [];
    for (const exam of exams) {
      const set = exam.sets.find((s) => s.id === picked[exam.id]);
      if (!set) continue;
      if (set.photo && photo.source) list.push({ exam, set, kind: "photo", spec: set.photo });
      if (set.signature && signature.source) list.push({ exam, set, kind: "signature", spec: set.signature });
    }
    return list;
  }, [exams, picked, photo.source, signature.source]);

  const pickedCount = Object.keys(picked).length;
  const settingsKey = JSON.stringify([
    picked,
    photo.source?.id,
    photoCrop.transform,
    signature.source?.id,
    signatureCrop.transform,
    cleanSignature,
  ]);
  const current = files?.key === settingsKey ? files.list : null;

  const toggle = (exam: KitExam, on: boolean) =>
    setPicked((p) => {
      const next = { ...p };
      if (on) next[exam.id] = exam.sets[0].id;
      else delete next[exam.id];
      return next;
    });

  const make = async () => {
    setError(null);
    revokeAll();
    setFiles(null);
    const list: KitFile[] = [];
    setProgress({ done: 0, total: jobs.length });
    try {
      for (const [i, job] of jobs.entries()) {
        const isPhoto = job.kind === "photo";
        const src = (isPhoto ? photo.source : signature.source) as SourceImage;
        const crop = isPhoto ? photoCrop : signatureCrop;
        const transform = { rotate: crop.rotation, flipH: crop.flipH, crop: deriveCrop(crop.pixels, specAspect(job.spec), crop.dims) };
        const cleanup = !isPhoto && cleanSignature ? SIGNATURE_CLEANUP : undefined;
        const out: OutputSpec = { widthPx: job.spec.widthPx, heightPx: job.spec.heightPx, minKB: job.spec.minKB, maxKB: job.spec.maxKB, dpi: job.spec.dpi };

        let result = await runSpec(runner.run, src, out, transform, cleanup);
        if (!result) return;
        let grown = false;
        // Allowed only where the notice's pixel size is preferred or a minimum, or it states none (as on the exam pages).
        if (result.underMin && (job.spec.pixelBasis === "preferred" || job.spec.pixelBasis === "minimum" || !job.spec.widthPx)) {
          const base = job.spec.widthPx ? out : { ...out, widthPx: result.width, heightPx: result.height };
          const bigger = await growToMinimum(runner.run, src, base, transform, cleanup);
          if (!bigger) return;
          result = bigger.result;
          grown = true;
        }

        const notes: string[] = [];
        if (grown) notes.push(`Enlarged to reach the ${job.spec.minKB} KB minimum.`);
        if (result.overMax) notes.push(`Couldn't get under ${job.spec.maxKB} KB; a plainer background or tighter framing helps.`);
        else if (result.underMin) notes.push(`Below the ${job.spec.minKB} KB minimum; use a sharper, more detailed image.`);
        if (isPhoto && job.spec.faceCoverage) notes.push(`Your face should fill about ${job.spec.faceCoverage}% of this photo: fine-tune it for a closer crop.`);
        if (job.spec.fileName) notes.push(`The form asks for the file name “${job.spec.fileName}”; the single download uses it.`);

        const url = URL.createObjectURL(result.blob);
        urls.current.push(url);
        const label = isPhoto ? "photo" : "signature";
        list.push({
          key: `${job.exam.id}-${job.kind}`,
          ...job,
          blob: result.blob,
          url,
          width: result.width,
          height: result.height,
          ok: !result.overMax && !result.underMin && pixelsOk(job.spec, result.width, result.height, grown),
          notes,
          zipName: `${job.exam.name} ${label}.jpg`,
          downloadName: job.spec.fileName ?? `${slug(job.exam.name)}-${label}.jpg`,
        });
        setProgress({ done: i + 1, total: jobs.length });
      }
      setFiles({ key: settingsKey, list });
      track("exam_kit_created", {
        tool: TOOL,
        count_bucket: pickedCount <= 1 ? "1" : pickedCount <= 5 ? "2-5" : pickedCount <= 10 ? "6-10" : "11+",
        outcome: list.every((f) => f.ok) ? "met" : "partial",
      });
    } catch (caught) {
      const normalized = toImageToolError(caught);
      setError(normalized);
      track("processing_failed", { tool: TOOL, error_code: normalized.code });
    } finally {
      setProgress(null);
    }
  };

  const downloadZip = async (list: KitFile[]) => {
    setZipping(true);
    try {
      const { createZip, safeZipName, uniqueNames } = await import("@/lib/zip/zip");
      const names = uniqueNames(list.map((f) => safeZipName(f.zipName)));
      const zip = await createZip(list.map((f, i) => ({ name: names[i], blob: f.blob })));
      const url = URL.createObjectURL(zip);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exam-photos-and-signatures.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      track("photo_downloaded", { tool: TOOL, mode: "zip", count_bucket: list.length <= 5 ? "1-5" : list.length <= 20 ? "6-20" : "21+" });
    } catch (caught) {
      setError(toImageToolError(caught));
    } finally {
      setZipping(false);
    }
  };

  const fineTune = (file: KitFile) => {
    const src = file.kind === "photo" ? photo.source : signature.source;
    if (src) handOffFiles([src.file]);
    router.push(file.exam.path);
  };

  const busy = progress !== null;
  const loadError = photo.error ?? signature.error ?? error;
  const missing = !photo.source && !signature.source ? "Add your photo, your signature, or both." : pickedCount === 0 ? "Tick the forms you're filling." : jobs.length === 0 ? "The ticked forms need the file you haven't added yet." : null;

  return (
    <div id="prepare" className="scroll-mt-4 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Upload
          title="1. Your photo"
          hint="Frame your head and shoulders once; each form's own shape is cut around it."
          state={photo}
          crop={photoCrop}
          aspect={PHOTO_FRAME}
          guide="portrait"
          prompt="Drop your photo"
          paste
        />
        <Upload
          title="2. Your signature"
          hint="Crop close around the ink."
          state={signature}
          crop={signatureCrop}
          aspect={null}
          guide="thirds"
          prompt="Drop a photo or scan of your signature"
          paste={false}
        >
          <label className="flex items-start gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={cleanSignature}
              onChange={(e) => setCleanSignature(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span>Clean the paper background to white</span>
          </label>
        </Upload>
      </div>

      <fieldset className="min-w-0 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <legend className="px-1 text-base font-bold text-ink">3. Tick the forms you&apos;re filling</legend>
        <div className="mt-2 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {KIT_GROUPS.map((group) => (
            <div key={group} className="min-w-0">
              <p className="text-sm font-semibold text-ink">{group}</p>
              <ul className="mt-2 space-y-1">
                {exams
                  .filter((e) => e.group === group)
                  .map((exam) => (
                    <li key={exam.id}>
                      <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={exam.id in picked}
                          onChange={(e) => toggle(exam, e.target.checked)}
                          className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
                        />
                        {exam.name}
                      </label>
                      {exam.id in picked && exam.sets.length > 1 ? (
                        // The wrapper sets the width: a select with long option names otherwise sizes itself to the
                        // longest one and runs into the next column.
                        <div className="mb-2 min-w-0 pl-8">
                          <select
                            aria-label={`${exam.name} notice`}
                            value={picked[exam.id]}
                            onChange={(e) => setPicked((p) => ({ ...p, [exam.id]: e.target.value }))}
                            className={`${inputClass} block w-full min-w-0 max-w-full truncate text-sm`}
                          >
                            {exam.sets.map((s) => (
                              <option key={s.id} value={s.id} title={s.name}>
                                {shortNoticeName(s.name)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          UPSC isn&apos;t listed: its sizes are published only inside its portal. Use the{" "}
          <a href="/tools/upsc-photo" className="underline underline-offset-2">UPSC photo resizer</a> with your numbers.
        </p>
      </fieldset>

      <div className="space-y-2">
        <button type="button" className={buttonClass("primary", "w-full sm:w-auto")} onClick={make} disabled={busy || jobs.length === 0}>
          {busy ? `Making files… ${progress?.done ?? 0} of ${progress?.total ?? 0}` : current ? "Make all files again" : `Make all files${jobs.length ? ` (${jobs.length})` : ""}`}
        </button>
        {missing && !busy ? <p className="text-sm text-muted">{missing}</p> : null}
      </div>

      {loadError ? (
        <Alert tone="error" title="Something went wrong">
          {loadError.message}
        </Alert>
      ) : null}

      {current ? <Results files={current} exams={exams} picked={picked} zipping={zipping} onZip={downloadZip} onFineTune={fineTune} /> : null}
    </div>
  );
}

function Upload({
  title,
  hint,
  state,
  crop,
  aspect,
  guide,
  prompt,
  paste,
  children,
}: {
  title: string;
  hint: string;
  state: ReturnType<typeof useSourceImage>;
  crop: ReturnType<typeof useCropState>;
  aspect: number | null;
  guide: "portrait" | "thirds";
  prompt: string;
  paste: boolean;
  children?: React.ReactNode;
}) {
  const { source, loading, select, clear } = state;
  return (
    <section className="min-w-0 space-y-3 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5" aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {source ? (
          <button type="button" onClick={clear} className="min-h-11 text-sm font-medium text-accent underline underline-offset-2">
            Change
          </button>
        ) : null}
      </div>
      {source ? (
        <>
          <p className="text-sm text-ink-soft">{hint}</p>
          <ImageCropper
            src={source.url}
            imageWidth={crop.dims.width}
            imageHeight={crop.dims.height}
            rotation={crop.rotation}
            flipH={crop.flipH}
            aspect={aspect}
            crop={crop.crop}
            onChange={crop.setCrop}
            guide={guide}
            label={`${title} crop area`}
          />
          <OrientationControls onRotate={crop.rotate} onFlip={crop.flip} flipped={crop.flipH} />
          {children}
        </>
      ) : (
        <ImageDropzone
          accept={RASTER_INPUT_FORMATS}
          onFile={(file) => void select(file)}
          loading={loading}
          prompt={prompt}
          compact
          paste={paste}
          acceptHandOff={paste}
        />
      )}
    </section>
  );
}

function Results({
  files,
  exams,
  picked,
  zipping,
  onZip,
  onFineTune,
}: {
  files: KitFile[];
  exams: KitExam[];
  picked: Record<string, string>;
  zipping: boolean;
  onZip: (files: KitFile[]) => void;
  onFineTune: (file: KitFile) => void;
}) {
  const allOk = files.every((f) => f.ok);
  // Notes that belong to the form rather than one file: a live photo, or uploads the kit doesn't make.
  const formNotes = exams
    .map((exam) => ({ exam, set: exam.sets.find((s) => s.id === picked[exam.id]) }))
    .filter((x): x is { exam: KitExam; set: KitSet } => Boolean(x.set && (x.set.livePhoto || x.set.extras.length)));

  return (
    <section aria-labelledby="kit-results" className="space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="kit-results" className="text-lg font-bold text-ink">
          Your files ({files.length})
        </h2>
        <button type="button" className={buttonClass("primary")} onClick={() => onZip(files)} disabled={zipping}>
          {zipping ? "Preparing ZIP…" : "Download all (ZIP)"}
        </button>
      </div>

      <ul className="divide-y divide-line rounded-md border border-line">
        {files.map((f) => (
          <li key={f.key} className="flex gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={f.url} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded border border-line bg-surface object-contain" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-ink">
                <span aria-hidden="true" className={f.ok ? "text-success-ink" : "text-warning"}>
                  {f.ok ? "✓ " : "! "}
                </span>
                {f.exam.name} {f.kind}
                <span className="sr-only">{f.ok ? ": meets the size and file limits" : ": needs attention"}</span>
              </p>
              <p className="tabular-nums text-ink-soft">
                {f.width} × {f.height} px · {formatBytes(f.blob.size)}
                {formatKbRange(f.spec) ? <span className="text-muted"> (needs {formatKbRange(f.spec)})</span> : null}
              </p>
              {f.notes.map((n) => (
                <p key={n} className="text-xs text-muted">
                  {n}
                </p>
              ))}
              <div className="mt-1 flex flex-wrap gap-x-4">
                <a href={f.url} download={f.downloadName} className="inline-flex min-h-11 items-center font-medium text-accent underline underline-offset-2">
                  Download
                </a>
                <button type="button" onClick={() => onFineTune(f)} className="inline-flex min-h-11 items-center text-ink-soft underline underline-offset-2">
                  Fine-tune on the {f.exam.name} page
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {formNotes.length ? (
        <ul className="space-y-1 text-sm text-ink-soft">
          {formNotes.map(({ exam, set }) => (
            <li key={exam.id}>
              <strong className="text-ink">{exam.name}:</strong>{" "}
              {[set.livePhoto ? "the form also takes a live photo with your camera" : null, set.extras.length ? `also needs a ${set.extras.join(" and a ")}, made on its own page` : null]
                .filter(Boolean)
                .join("; ")}
              .
            </li>
          ))}
        </ul>
      ) : null}

      <Alert tone={allOk ? "success" : "info"} title={allOk ? "Every file meets its form's size and file limits" : "Check the files marked !"}>
        The kit checks pixel size, file size and format only. Application requirements can change: verify each file against the
        latest official notification or portal before submitting.
      </Alert>
    </section>
  );
}

