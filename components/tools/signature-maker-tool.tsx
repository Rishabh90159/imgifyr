"use client";

import { Caveat, Dancing_Script, Great_Vibes, Sacramento } from "next/font/google";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { FieldLabel, inputClass, Segmented } from "@/components/controls/fields";
import { track } from "@/lib/analytics";
import { handOffFiles } from "@/lib/handoff";

/**
 * Signature maker: draw a signature with a finger, stylus or mouse, or type a name in a handwriting font, then
 * download it as a transparent PNG or a JPG on white, trimmed to the ink. Everything is drawn on canvases in the
 * browser. "Resize for an exam form" hands the JPG to the signature resizer, which sets pixel and KB limits.
 */

// Self-hosted by next/font at build time: no request goes to Google. preload: false, so a font file is only fetched
// when the Type tab shows text in it.
const dancing = Dancing_Script({ subsets: ["latin"], display: "swap", preload: false });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const caveat = Caveat({ subsets: ["latin"], display: "swap", preload: false });
const sacramento = Sacramento({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

const FONTS = [
  { id: "dancing", label: "Flowing", family: dancing.style.fontFamily, scale: 1 },
  { id: "great-vibes", label: "Elegant", family: greatVibes.style.fontFamily, scale: 1.15 },
  { id: "caveat", label: "Casual", family: caveat.style.fontFamily, scale: 1.05 },
  { id: "sacramento", label: "Slim", family: sacramento.style.fontFamily, scale: 1.25 },
] as const;
type FontId = (typeof FONTS)[number]["id"];

const INKS = { black: "#111111", blue: "#1b3fa0" } as const;
type Ink = keyof typeof INKS;
const PENS = { thin: 2, medium: 3.2, thick: 4.6 } as const;
type Pen = keyof typeof PENS;
type Mode = "draw" | "type";

interface Stroke {
  ink: string;
  width: number;
  points: [number, number][];
}

/** Export resolution relative to the drawing pad, so the file stays sharp when a form scales it. */
const EXPORT_SCALE = 3;
/** Space kept around the ink in the exported file, in pad pixels. */
const PADDING = 10;
/** Font size used for a typed signature in the exported file. */
const TYPE_PX = 140;

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const pts = stroke.points;
  ctx.strokeStyle = stroke.ink;
  ctx.fillStyle = stroke.ink;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Midpoint quadratic curves smooth the jitter of finger and mouse input.
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
}

/** Renders the drawn strokes, trimmed to the ink plus padding, at EXPORT_SCALE. */
function exportDrawing(strokes: Stroke[]): HTMLCanvasElement {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (const [x, y] of s.points) {
      minX = Math.min(minX, x - s.width);
      minY = Math.min(minY, y - s.width);
      maxX = Math.max(maxX, x + s.width);
      maxY = Math.max(maxY, y + s.width);
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil((maxX - minX + PADDING * 2) * EXPORT_SCALE);
  canvas.height = Math.ceil((maxY - minY + PADDING * 2) * EXPORT_SCALE);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  ctx.translate(PADDING - minX, PADDING - minY);
  for (const s of strokes) drawStroke(ctx, s);
  return canvas;
}

/** Renders a typed name in the chosen font, trimmed to the glyphs plus padding. */
async function exportTyped(text: string, family: string, scale: number, ink: string): Promise<HTMLCanvasElement> {
  const size = Math.round(TYPE_PX * scale);
  const font = `${size}px ${family}`;
  // The font is fetched on first use; drawing before it has loaded would fall back to a plain typeface.
  await document.fonts.load(font, text);
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const m = probe.measureText(text);
  const pad = Math.round(size * 0.12);
  const width = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2;
  const height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  ctx.fillStyle = ink;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, pad + m.actualBoundingBoxLeft, pad + m.actualBoundingBoxAscent);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg"): Promise<Blob> {
  let source = canvas;
  if (type === "image/jpeg") {
    // JPG has no transparency: put the ink on white.
    source = document.createElement("canvas");
    source.width = canvas.width;
    source.height = canvas.height;
    const ctx = source.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, source.width, source.height);
    ctx.drawImage(canvas, 0, 0);
  }
  return new Promise((resolve, reject) =>
    source.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image"))), type, 0.95),
  );
}

interface Made {
  png: Blob;
  jpg: Blob;
  pngUrl: string;
  jpgUrl: string;
  width: number;
  height: number;
}

export function SignatureMakerTool() {
  const router = useRouter();
  const nameId = useId();
  const [mode, setMode] = useState<Mode>("draw");
  const [ink, setInk] = useState<Ink>("black");
  const [pen, setPen] = useState<Pen>("medium");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [name, setName] = useState("");
  const [fontId, setFontId] = useState<FontId>("dancing");
  const [made, setMade] = useState<Made | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const padRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  strokesRef.current = strokes;

  /** Sizes the pad's pixels to its CSS box at the screen's density and redraws every stroke. */
  const redraw = useCallback(() => {
    const canvas = padRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (drawing.current) drawStroke(ctx, drawing.current);
  }, []);

  useEffect(() => {
    if (mode !== "draw") return;
    redraw();
    const observer = new ResizeObserver(redraw);
    if (padRef.current) observer.observe(padRef.current);
    return () => observer.disconnect();
  }, [mode, redraw, strokes]);

  // A new drawing or new text makes the previous result stale.
  useEffect(() => {
    setMade((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.pngUrl);
        URL.revokeObjectURL(previous.jpgUrl);
      }
      return null;
    });
  }, [mode, strokes, name, fontId, ink]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = { ink: INKS[ink], width: PENS[pen], points: [point(event)] };
    redraw();
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current.points.push(point(event));
    redraw();
  };
  const onPointerUp = () => {
    if (!drawing.current) return;
    const stroke = drawing.current;
    drawing.current = null;
    setStrokes((current) => [...current, stroke]);
  };

  const font = FONTS.find((f) => f.id === fontId)!;
  const ready = mode === "draw" ? strokes.length > 0 : name.trim().length > 0;

  const create = async () => {
    setError(null);
    setBusy(true);
    try {
      const canvas = mode === "draw" ? exportDrawing(strokes) : await exportTyped(name.trim(), font.family, font.scale, INKS[ink]);
      const [png, jpg] = await Promise.all([toBlob(canvas, "image/png"), toBlob(canvas, "image/jpeg")]);
      setMade({ png, jpg, pngUrl: URL.createObjectURL(png), jpgUrl: URL.createObjectURL(jpg), width: canvas.width, height: canvas.height });
      track("signature_created", { tool: "signature-maker", mode: mode === "draw" ? "draw" : `type-${fontId}` });
    } catch {
      setError("Couldn't create the signature image. Try again, or use a different browser.");
    } finally {
      setBusy(false);
    }
  };

  const resizeForForm = () => {
    if (!made) return;
    handOffFiles([new File([made.jpg], "signature.jpg", { type: "image/jpeg" })]);
    track("download_clicked", { tool: "signature-maker", output_format: "handoff-resizer" });
    router.push("/tools/signature-resizer");
  };

  return (
    <div id="prepare" className="space-y-5 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
      <Segmented<Mode>
        legend="How do you want to make it?"
        value={mode}
        onChange={setMode}
        options={[
          { value: "draw", label: "Draw" },
          { value: "type", label: "Type" },
        ]}
      />

      {mode === "draw" ? (
        <div className="space-y-3">
          <div className="relative">
            <canvas
              ref={padRef}
              aria-label="Signature pad: sign here with your finger, a stylus or the mouse. To type your name instead, choose Type."
              role="img"
              className="block h-56 w-full cursor-crosshair touch-none rounded-md border border-line-strong bg-white sm:h-64"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
            {/* A signing line, like on paper; it is only on the screen, not in the file. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-12 border-b border-dashed border-line-strong" />
            {strokes.length === 0 ? (
              <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-muted">
                Sign here
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass("secondary")} onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={strokes.length === 0}>
              Undo
            </button>
            <button type="button" className={buttonClass("secondary")} onClick={() => setStrokes([])} disabled={strokes.length === 0}>
              Clear
            </button>
          </div>
          <Segmented<Pen>
            legend="Pen"
            value={pen}
            onChange={setPen}
            options={[
              { value: "thin", label: "Thin" },
              { value: "medium", label: "Medium" },
              { value: "thick", label: "Thick" },
            ]}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor={nameId}>Your name</FieldLabel>
            <input
              id={nameId}
              type="text"
              value={name}
              maxLength={40}
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-ink">Style</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <label
                  key={f.id}
                  className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-md border px-3 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                    fontId === f.id ? "border-accent bg-accent-soft" : "border-line-strong bg-canvas hover:bg-surface"
                  }`}
                >
                  <input type="radio" name={`${nameId}-font`} value={f.id} checked={fontId === f.id} onChange={() => setFontId(f.id)} className="sr-only" />
                  {/* The preview is decoration; the option is announced by its style name only. */}
                  <span aria-hidden="true" className="truncate text-2xl leading-tight" style={{ fontFamily: f.family, color: INKS[ink] }}>
                    {name.trim() || "Your Name"}
                  </span>
                  <span className="text-xs text-muted">{f.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Alert tone="info" title="For exam and government forms, draw instead">
            Most notices ask for your own handwritten signature. A typed font is fine for letters, emails and documents.
          </Alert>
        </div>
      )}

      <Segmented<Ink>
        legend="Ink colour"
        value={ink}
        onChange={setInk}
        options={[
          { value: "black", label: "Black" },
          { value: "blue", label: "Blue" },
        ]}
      />

      <button type="button" className={buttonClass("primary", "w-full sm:w-auto")} onClick={create} disabled={!ready || busy}>
        {busy ? "Creating…" : made ? "Create again" : "Create signature"}
      </button>

      {error ? <Alert tone="error" title="Something went wrong">{error}</Alert> : null}

      {made ? (
        <section aria-labelledby="result-heading" className="space-y-4 border-t border-line pt-5">
          <h2 id="result-heading" className="text-lg font-bold text-ink">
            Your signature
          </h2>
          <div className="checkerboard flex justify-center rounded-md border border-line p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview, not an optimisable asset */}
            <img src={made.pngUrl} alt="Your signature preview" className="max-h-40 w-auto max-w-full" />
          </div>
          <p className="text-sm text-muted">
            {made.width} × {made.height} px, trimmed to the ink. PNG keeps a see-through background; JPG puts it on white.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={made.pngUrl}
              download="signature.png"
              className={buttonClass("primary")}
              onClick={() => track("download_clicked", { tool: "signature-maker", output_format: "png" })}
            >
              Download PNG (transparent)
            </a>
            <a
              href={made.jpgUrl}
              download="signature.jpg"
              className={buttonClass("secondary")}
              onClick={() => track("download_clicked", { tool: "signature-maker", output_format: "jpg" })}
            >
              Download JPG (white)
            </a>
            <button type="button" className={buttonClass("secondary")} onClick={resizeForForm}>
              Resize for an exam form →
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
