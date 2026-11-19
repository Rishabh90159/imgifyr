"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { FieldLabel, inputClass } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import type { Finding } from "@/lib/checker/check";
import { assessFrame, faceBox, type FaceFound } from "@/lib/checker/live";
import { handOffFiles } from "@/lib/handoff";
import type { ToolId } from "@/lib/tools/registry";
import { useToolOpen } from "./hooks";

const TOOL: ToolId = "live-photo-practice";

export interface LiveExam {
  id: string;
  name: string;
  rules: string[];
}

/** The browser's built-in face detector, where it exists (Chrome on Android and some desktops). Nothing is downloaded. */
interface FaceDetectorLike {
  detect(source: CanvasImageSource): Promise<{ boundingBox: DOMRectReadOnly }[]>;
}
function makeDetector(): FaceDetectorLike | null {
  const Ctor = (globalThis as unknown as { FaceDetector?: new (o: { fastMode: boolean; maxDetectedFaces: number }) => FaceDetectorLike }).FaceDetector;
  try {
    return Ctor ? new Ctor({ fastMode: true, maxDetectedFaces: 1 }) : null;
  } catch {
    return null;
  }
}

const CAMERA_ERRORS: Record<string, string> = {
  NotAllowedError: "Camera permission was blocked. Allow the camera for this site (the camera icon in the address bar), then press Start again.",
  NotFoundError: "No camera was found on this device.",
  NotReadableError: "The camera is busy in another app (Zoom, Teams, WhatsApp…). Close it, then press Start again.",
  SecurityError: "The browser blocked the camera on this page.",
};

export function LivePhotoPracticeTool({ exams }: { exams: LiveExam[] }) {
  useToolOpen(TOOL);
  const router = useRouter();
  const examId = useId();
  const [examChoice, setExamChoice] = useState(exams[0]?.id ?? "");
  const exam = exams.find((e) => e.id === examChoice) ?? exams[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [hasDetector, setHasDetector] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);
  const [shot, setShot] = useState<{ blob: Blob; url: string; findings: Finding[] } | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    setFindings([]);
  }, []);

  useEffect(() => stop, [stop]);
  useEffect(() => () => (shot ? URL.revokeObjectURL(shot.url) : undefined), [shot]);

  const start = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't open the camera. Try Chrome, Edge or Safari, on a page opened with https.");
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setAspect(video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 4 / 3);
      setRunning(true);
      track("live_practice_started", { tool: TOOL, preset: exam?.id ?? "none" });
    } catch (caught) {
      const name = (caught as { name?: string })?.name ?? "";
      setError(CAMERA_ERRORS[name] ?? "The camera couldn't be started. Check the browser's camera permission and try again.");
    } finally {
      setStarting(false);
    }
  };

  // Judge a small copy of the frame about four times a second.
  useEffect(() => {
    if (!running) return;
    const video = videoRef.current;
    if (!video) return;
    const detector = makeDetector();
    setHasDetector(Boolean(detector));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let busy = false;
    const timer = window.setInterval(async () => {
      if (busy || !ctx || video.readyState < 2 || !video.videoWidth) return;
      busy = true;
      try {
        const w = 192;
        const h = Math.round((w * video.videoHeight) / video.videoWidth);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const px = ctx.getImageData(0, 0, w, h);
        let face: FaceFound;
        if (detector) {
          try {
            const found = await detector.detect(canvas);
            const r = found[0]?.boundingBox;
            face = r ? { x: r.x / w, y: r.y / h, width: r.width / w, height: r.height / h } : null;
          } catch {
            face = undefined;
          }
        }
        setFindings(assessFrame(px, faceBox(w, h), face));
      } finally {
        busy = false;
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const snapshot = findings;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setShot({ blob, url: URL.createObjectURL(blob), findings: snapshot });
        track("live_practice_captured", { tool: TOOL, preset: exam?.id ?? "none", outcome: snapshot.some((f) => f.verdict !== "pass") ? "warn" : "pass" });
      },
      "image/jpeg",
      0.92,
    );
  };

  const box = faceBox(aspect, 1);
  const allGood = findings.length > 0 && findings.every((f) => f.verdict === "pass");

  return (
    <div id="prepare" className="scroll-mt-4 space-y-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-line bg-black" style={{ aspectRatio: String(aspect) }}>
            {/* Mirrored like a mirror, so moving left moves left on screen; the saved practice photo is not mirrored. */}
            <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" aria-label="Camera preview" />
            {running ? (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute rounded-[40%] border-4 ${allGood ? "border-success-ink" : "border-red-500"}`}
                style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%` }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <p className="text-sm text-white/85">Your camera picture stays on this device. Nothing is recorded or uploaded.</p>
                <button type="button" className={buttonClass("primary")} onClick={start} disabled={starting}>
                  {starting ? "Starting camera…" : "Start camera"}
                </button>
              </div>
            )}
          </div>
          {running ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonClass("primary")} onClick={capture}>
                Take practice photo
              </button>
              <button type="button" className={buttonClass("secondary")} onClick={stop}>
                Stop camera
              </button>
            </div>
          ) : null}
          {error ? (
            <Alert tone="error" title="Camera not available">
              {error}
            </Alert>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <section aria-labelledby="live-check" className="rounded-lg border border-line bg-canvas p-4 shadow-sm">
            <h2 id="live-check" className="text-base font-bold text-ink">
              {!running ? "Live check" : !allGood ? "Live check" : hasDetector ? "Ready: all checks pass" : "Light, background and sharpness look good"}
            </h2>
            {running ? (
              <ul className="mt-2 space-y-2 text-sm" aria-live="polite" aria-label="Live check results">
                {findings.map((f) => (
                  <li key={f.id} className="flex gap-2">
                    <span aria-hidden="true" className={`font-bold ${f.verdict === "pass" ? "text-success-ink" : "text-warning"}`}>
                      {f.verdict === "pass" ? "✓" : "!"}
                    </span>
                    <span>
                      <span className="font-medium text-ink">{f.label}: </span>
                      <span className="text-ink-soft">{f.detail}</span>
                    </span>
                  </li>
                ))}
                {!hasDetector ? (
                  <li className="text-xs text-muted">This browser has no built-in face finder: line your face up with the box yourself.</li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Start the camera to check light, background, sharpness and framing as you move.</p>
            )}
          </section>

          {exams.length ? (
            <section aria-labelledby="live-rules" className="rounded-lg border border-line bg-canvas p-4 shadow-sm">
              <h2 id="live-rules" className="sr-only">
                Official live photo rules
              </h2>
              <FieldLabel htmlFor={examId}>Practising for</FieldLabel>
              <select id={examId} value={exam?.id} onChange={(e) => setExamChoice(e.target.value)} className={`${inputClass} mt-1.5 block w-full min-w-0 truncate`}>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              {exam ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {exam.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>

      {shot ? (
        <section aria-labelledby="practice-shot" className="space-y-3 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
          <h2 id="practice-shot" className="text-lg font-bold text-ink">
            Your practice photo
          </h2>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local snapshot */}
            <img src={shot.url} alt="Your practice photo" className="w-full rounded border border-line object-contain" />
            <div className="min-w-0 space-y-2 text-sm">
              <p className="text-ink-soft">
                {shot.findings.every((f) => f.verdict === "pass")
                  ? "Everything we can measure passed when you took it."
                  : `To improve: ${shot.findings
                      .filter((f) => f.verdict !== "pass")
                      .map((f) => f.detail)
                      .join(" ")}`}
              </p>
              <p className="text-muted">
                Forms with live capture take their own photo, so this one is just for practice. It can also be used for forms that
                ask for an uploaded photo.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={shot.url} download="practice-photo.jpg" className={buttonClass("secondary")}>
                  Download
                </a>
                <button
                  type="button"
                  className={buttonClass("secondary")}
                  onClick={() => {
                    handOffFiles([new File([shot.blob], "practice-photo.jpg", { type: "image/jpeg" })]);
                    stop();
                    router.push("/tools/all-exam-photo-signature");
                  }}
                >
                  Use it in the all-exam kit
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
