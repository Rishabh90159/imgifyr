"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { Segmented } from "@/components/controls/fields";
import { NoticeChoice } from "@/components/controls/notice-choice";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { checkFile, checkPhoto, checkSignature, type FileFacts, type Finding, type FixTarget } from "@/lib/checker/check";
import { photoMetrics, signatureMetrics, type PhotoMetrics, type SignatureMetrics } from "@/lib/checker/metrics";
import { handOffFiles } from "@/lib/handoff";
import { readImageDpi } from "@/lib/image-processing/dpi";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { readJpegInfo } from "@/lib/image-processing/jpeg-info";
import { detectFormat, readDimensions } from "@/lib/image-processing/sniff";
import { KIT_GROUPS, shortNoticeName, type KitExam } from "@/lib/requirements/kit";
import type { ToolId } from "@/lib/tools/registry";
import { useToolOpen } from "./hooks";

const TOOL: ToolId = "exam-photo-checker";
type Kind = "photo" | "signature";

const FIX_PATH: Record<Exclude<FixTarget, "exam">, string> = {
  "image-to-jpg": "/tools/image-to-jpg",
  "heic-to-jpg": "/tools/heic-to-jpg",
  "resize-image-to-kb": "/tools/resize-image-to-kb",
  "white-background-photo": "/tools/white-background-photo",
  "image-quality-enhancer": "/tools/image-quality-enhancer",
  "signature-resizer": "/tools/signature-resizer",
};

interface Loaded {
  file: File;
  url: string;
  facts: FileFacts;
  photo: PhotoMetrics | null;
  signature: SignatureMetrics | null;
}

/** Reads what a portal would see (type from the bytes, stored pixel size, rotation tag, DPI) and measures a small copy. */
async function load(file: File): Promise<Loaded> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectFormat(bytes);
  const jpeg = detected === "image/jpeg" ? readJpegInfo(bytes) : null;
  const dims = jpeg ?? (detected ? readDimensions(bytes, detected) : null);
  let photo: PhotoMetrics | null = null;
  let signature: SignatureMetrics | null = null;
  let shown = dims;
  try {
    const bitmap = await createImageBitmap(file);
    shown = shown ?? { width: bitmap.width, height: bitmap.height };
    const scale = Math.min(1, 400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
    photo = photoMetrics(px);
    signature = signatureMetrics(px);
  } catch {
    // Formats the browser can't decode (HEIC on most browsers): the file checks still run.
  }
  let dpi: number | null = null;
  try {
    dpi = readImageDpi(bytes).dpi;
  } catch {
    dpi = null;
  }
  return {
    file,
    url: URL.createObjectURL(file),
    facts: { name: file.name, bytes: file.size, detected, width: shown?.width ?? 0, height: shown?.height ?? 0, orientation: jpeg?.orientation ?? 1, dpi },
    photo,
    signature,
  };
}

export function PhotoCheckerTool({ exams }: { exams: KitExam[] }) {
  useToolOpen(TOOL);
  const router = useRouter();
  const examId = useId();
  const [kind, setKind] = useState<Kind>("photo");
  const [examChoice, setExamChoice] = useState("");
  const [noticeChoice, setNoticeChoice] = useState("");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => (loaded ? URL.revokeObjectURL(loaded.url) : undefined), [loaded]);

  const exam = exams.find((e) => e.id === examChoice) ?? null;
  const set = exam ? (exam.sets.find((s) => s.id === noticeChoice) ?? exam.sets[0]) : null;
  const spec = set ? (kind === "photo" ? set.photo : set.signature) : undefined;
  const liveOnly = Boolean(exam && kind === "photo" && set && !set.photo && set.livePhoto);

  const findings: Finding[] = useMemo(() => {
    if (!loaded) return [];
    const list = checkFile(loaded.facts, spec);
    if (kind === "photo" && loaded.photo) list.push(...checkPhoto(loaded.photo, Boolean(spec?.rules.some((r) => /white|light/i.test(r)))));
    if (kind === "signature" && loaded.signature) list.push(...checkSignature(loaded.signature, Boolean(spec?.rules.some((r) => /miniature/i.test(r)))));
    return list;
  }, [loaded, spec, kind]);

  const fails = findings.filter((f) => f.verdict === "fail").length;
  const warns = findings.filter((f) => f.verdict === "warn").length;

  useEffect(() => {
    if (loaded) track("photo_checked", { tool: TOOL, mode: kind, preset: set?.id ?? "general", outcome: fails ? "fail" : warns ? "warn" : "pass" });
    // One event per file and choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, kind, set?.id]);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      setLoaded(await load(file));
    } finally {
      setBusy(false);
    }
  };

  const fix = (target: FixTarget) => {
    if (!loaded) return;
    const path = target === "exam" ? (exam?.path ?? (kind === "photo" ? "/tools/resize-image-to-kb" : "/tools/signature-resizer")) : FIX_PATH[target];
    handOffFiles([loaded.file]);
    router.push(path);
  };

  const kindPicker = (
    <Segmented<Kind>
      legend="What are you checking?"
      value={kind}
      onChange={setKind}
      options={[
        { value: "photo", label: "Photograph" },
        { value: "signature", label: "Signature" },
      ]}
    />
  );

  const pickExam = (id: string) => {
    setExamChoice(id);
    setNoticeChoice("");
  };

  const examPicker = (
    <div className="space-y-3">
      {/* Buttons, not a <select>: an open list of 23 exams covered the page on phones and desktops alike. */}
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-ink">Check against</legend>
        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            <ExamChip name={examId} value="" label="Any form (general checks)" checked={examChoice === ""} onPick={pickExam} />
          </div>
          {KIT_GROUPS.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {exams
                  .filter((e) => e.group === group)
                  .map((e) => (
                    <ExamChip key={e.id} name={examId} value={e.id} label={e.name} checked={examChoice === e.id} onPick={pickExam} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      {exam && exam.sets.length > 1 ? (
        <NoticeChoice
          legend="Notice"
          options={exam.sets.map((s) => ({ id: s.id, label: shortNoticeName(s.name) }))}
          value={set?.id ?? ""}
          onChange={setNoticeChoice}
        />
      ) : null}
      {liveOnly ? (
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">This form takes the photo live with your camera</strong>, so there&apos;s no photo file to
          upload. <a href="/tools/live-photo-practice" className="font-medium text-accent underline underline-offset-2">Practise the live photo</a>; below are
          general photo checks.
        </p>
      ) : exam && !spec ? (
        <p className="text-sm text-ink-soft">This form doesn&apos;t ask for a {kind} file; below are general checks.</p>
      ) : null}
    </div>
  );

  if (!loaded) {
    return (
      <div id="prepare" className="scroll-mt-4 space-y-4">
        {kindPicker}
        <ImageDropzone accept={RASTER_INPUT_FORMATS} onFile={(f) => void onFile(f)} loading={busy} prompt={`Drop the ${kind} you want to check`} />
        <div className="rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">{examPicker}</div>
      </div>
    );
  }

  return (
    <div id="prepare" className="scroll-mt-4 grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="min-w-0 space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the checked file */}
        <img src={loaded.url} alt={`The ${kind} being checked`} className="mx-auto max-h-64 w-auto rounded border border-line bg-surface object-contain" />
        <p className="truncate text-center text-xs text-muted">{loaded.file.name}</p>
        {kindPicker}
        {examPicker}
        <button type="button" className={buttonClass("secondary", "w-full")} onClick={() => setLoaded(null)}>
          Check another file
        </button>
      </div>

      <section aria-labelledby="check-results" className="min-w-0 space-y-4">
        <h2 id="check-results" className="text-lg font-bold text-ink">
          {fails ? `${fails} problem${fails > 1 ? "s" : ""} to fix` : warns ? `Looks OK, ${warns} thing${warns > 1 ? "s" : ""} to check` : "No problems found"}
          {exam ? <span className="block text-sm font-normal text-muted">Checked against {exam.name}{set && exam.sets.length > 1 ? `: ${set.name}` : ""}</span> : null}
        </h2>
        <ul className="divide-y divide-line rounded-md border border-line bg-canvas" aria-label="Check results">
          {findings.map((f) => (
            <li key={f.id} className="flex items-start gap-3 px-4 py-3 text-sm">
              <span
                aria-hidden="true"
                className={`mt-0.5 font-bold ${f.verdict === "pass" ? "text-success-ink" : f.verdict === "warn" ? "text-warning" : "text-danger-ink"}`}
              >
                {f.verdict === "pass" ? "✓" : f.verdict === "warn" ? "!" : "✗"}
              </span>
              <div className="min-w-0 flex-1">
                <p>
                  <span className="font-medium text-ink">{f.label}: </span>
                  <span className="sr-only">{f.verdict === "pass" ? "passed. " : f.verdict === "warn" ? "check this. " : "problem. "}</span>
                  <span className="text-ink-soft">{f.detail}</span>
                </p>
                {f.fix && f.verdict !== "pass" ? (
                  <button type="button" onClick={() => fix(f.fix!)} className="mt-1 inline-flex min-h-11 items-center font-medium text-accent underline underline-offset-2">
                    Fix it
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <Alert tone="info" title="What this check can and can't tell">
          File type, pixel size, file size and DPI are measured exactly. Light, background, sharpness and signature size are
          estimates from the pixels. It can&apos;t judge pose, expression or how recent the photo is, and requirements can change:
          verify against the latest official notice.
        </Alert>
      </section>
    </div>
  );
}

/** One exam as a compact radio "chip"; native radios keep keyboard and screen-reader support. */
function ExamChip({ name, value, label, checked, onPick }: { name: string; value: string; label: string; checked: boolean; onPick: (id: string) => void }) {
  return (
    <label
      className={`inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-accent bg-accent-soft text-accent" : "border-line bg-canvas text-ink-soft hover:bg-surface"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onPick(value)} className="sr-only" />
      {label}
    </label>
  );
}
