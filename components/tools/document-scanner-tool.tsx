"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/controls/alert";
import { buttonClass } from "@/components/controls/button";
import { Segmented } from "@/components/controls/fields";
import { DownloadButton } from "@/components/download-button/download-button";
import { ImageDropzone } from "@/components/image-uploader/image-dropzone";
import { track } from "@/lib/analytics";
import { readJpegInfo } from "@/lib/image-processing/jpeg-info";
import { detectFormat, readDimensions } from "@/lib/image-processing/sniff";
import { searchTargetSize } from "@/lib/image-processing/target-size";
import { buildPdf, MARGINS, placeImage, type PdfImage } from "@/lib/pdf/pdf-writer";
import { enhance, rotate, type ScanMode } from "@/lib/scanner/enhance";
import { detectSheet, flatSize, fullQuad, warp, type Point, type Quad, type Raster } from "@/lib/scanner/geometry";
import type { ToolId } from "@/lib/tools/registry";
import { countBucket, formatBytes, KB } from "@/lib/utils/format";
import { useToolOpen } from "./hooks";

const TOOL: ToolId = "document-scanner";
const MAX_PAGES = 20;
/** Long side of the copy used for editing and previews, and of the final pages (about 190 DPI on A4). */
const EDIT_SIDE = 1200;
const FINAL_SIDE = 2200;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;

type Limit = "none" | "100" | "200" | "500" | "1024";

interface Page {
  id: string;
  file: File;
  /** Small copy for corner editing, with its own size. */
  edit: Raster;
  editUrl: string;
  /** Corners as fractions (0–1) of the picture, so they apply at any resolution. */
  quad: Quad;
  autoQuad: Quad | null;
  turns: number;
  previewUrl: string | null;
}

let nextId = 0;

/** Upright pixel size read from the file header, without decoding the picture. */
async function headerSize(file: File): Promise<{ width: number; height: number } | null> {
  const bytes = new Uint8Array(await file.slice(0, 512 * 1024).arrayBuffer());
  const format = detectFormat(bytes);
  if (!format) return null;
  const jpeg = format === "image/jpeg" ? readJpegInfo(bytes) : null;
  const dims = jpeg ?? readDimensions(bytes, format);
  if (!dims) return null;
  // EXIF orientations 5–8 store the picture turned a quarter.
  return (jpeg?.orientation ?? 1) >= 5 ? { width: dims.height, height: dims.width } : { width: dims.width, height: dims.height };
}

/**
 * Decodes a photo at most `maxSide` pixels on its long side. Phone cameras take 50–200 megapixel photos; decoding one at
 * full size needs hundreds of MB and can crash a phone's browser tab (the photo is then lost), so the browser is asked
 * to decode it already shrunk. If it returns a different shape than the header says, a normal decode is used instead.
 */
async function openBitmap(file: File, maxSide: number): Promise<ImageBitmap> {
  const size = await headerSize(file).catch(() => null);
  if (size && Math.max(size.width, size.height) > maxSide) {
    const scale = maxSide / Math.max(size.width, size.height);
    const width = Math.max(1, Math.round(size.width * scale));
    const height = Math.max(1, Math.round(size.height * scale));
    try {
      const small = await createImageBitmap(file, { resizeWidth: width, resizeHeight: height, resizeQuality: "high", imageOrientation: "from-image" });
      if (Math.abs(small.width / small.height - size.width / size.height) < 0.02) return small;
      small.close();
    } catch {
      // Older browsers without resize options fall through to a normal decode.
    }
  }
  return createImageBitmap(file);
}

async function decode(file: File, maxSide: number): Promise<Raster> {
  const bitmap = await openBitmap(file, maxSide);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: d.data, width: d.width, height: d.height };
}

/** A smaller copy of a raster (for corner detection), drawn through a canvas. */
function shrink(r: Raster, maxSide: number): Raster {
  const scale = Math.min(1, maxSide / Math.max(r.width, r.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(r.width * scale));
  canvas.height = Math.max(1, Math.round(r.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(toCanvas(r), 0, 0, canvas.width, canvas.height);
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: d.data, width: d.width, height: d.height };
}

function toCanvas(r: Raster): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = r.width;
  canvas.height = r.height;
  canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(r.data), r.width, r.height), 0, 0);
  return canvas;
}

const blobOf = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", quality));

const scaleQuad = (q: Quad, w: number, h: number): Quad => q.map((p) => ({ x: p.x * w, y: p.y * h })) as Quad;
const toFractions = (q: Quad, w: number, h: number): Quad => q.map((p) => ({ x: p.x / w, y: p.y / h })) as Quad;

/** Flatten, clean and turn one page at `side` resolution. */
function render(source: Raster, quad: Quad, mode: ScanMode, turns: number, side: number): Raster {
  const q = scaleQuad(quad, source.width, source.height);
  const size = flatSize(q, side);
  return rotate(enhance(warp(source, q, size.width, size.height), mode), turns);
}

const yieldToBrowser = () => new Promise((r) => setTimeout(r, 0));

export function DocumentScannerTool() {
  useToolOpen(TOOL);
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<ScanMode>("color");
  const [limit, setLimit] = useState<Limit>("none");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<{ label: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; blob: Blob; url: string; pages: number; overLimit: boolean } | null>(null);
  // A direct camera button was removed (19–21 Nov 2026): on the owner's phone the photo was lost on returning from the
  // camera. Phones get a tip to take the photo with the camera app first and choose it, which works. Decided after
  // mounting, so the server-rendered page and the first render match.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    setIsPhone(window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0);
  }, []);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  // Object URLs are released when pages go away and on leaving.
  useEffect(
    () => () => {
      for (const p of pagesRef.current) {
        URL.revokeObjectURL(p.editUrl);
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      }
    },
    [],
  );
  useEffect(() => () => (result ? URL.revokeObjectURL(result.url) : undefined), [result]);

  const addFiles = async (files: File[]) => {
    setError(null);
    const room = MAX_PAGES - pagesRef.current.length;
    if (room <= 0) {
      setError(`A scan can have up to ${MAX_PAGES} pages.`);
      return;
    }
    setLoading(true);
    const added: Page[] = [];
    for (const file of files.slice(0, room)) {
      try {
        const edit = await decode(file, EDIT_SIDE);
        const small = shrink(edit, 400);
        const found = detectSheet(small);
        const quad = found ? toFractions(found, small.width, small.height) : toFractions(fullQuad(1, 1, 0.02), 1, 1);
        const editUrl = URL.createObjectURL(await blobOf(toCanvas(edit), 0.85));
        added.push({ id: `p${nextId++}`, file, edit, editUrl, quad, autoQuad: found ? quad : null, turns: 0, previewUrl: null });
      } catch {
        setError(`“${file.name}” couldn't be opened. Use a JPG, PNG or WebP photo (iPhone HEIC photos: convert them first with HEIC to JPG). If it came straight from the camera, try again with the camera set to a lower resolution.`);
      }
    }
    if (files.length > room) setError(`Only the first ${room} photos were added: a scan can have up to ${MAX_PAGES} pages.`);
    setPages((list) => [...list, ...added]);
    if (added.length) setSelected((s) => s ?? added[0].id);
    setLoading(false);
    if (added.length) track("image_uploaded", { tool: TOOL, count_bucket: countBucket(added.length) });
  };

  const update = (id: string, patch: Partial<Page>) => setPages((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // Live preview of each page in the chosen mode (small, so it stays quick); redone when its corners, turns or mode change.
  const previewKey = pages.map((p) => `${p.id}:${p.quad.map((c) => `${c.x.toFixed(4)},${c.y.toFixed(4)}`).join(";")}:${p.turns}`).join("|") + mode;
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      for (const p of pagesRef.current) {
        if (cancelled) return;
        const out = render(p.edit, p.quad, mode, p.turns, 700);
        const url = URL.createObjectURL(await blobOf(toCanvas(out), 0.8));
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        setPages((list) =>
          list.map((x) => {
            if (x.id !== p.id) return x;
            if (x.previewUrl) URL.revokeObjectURL(x.previewUrl);
            return { ...x, previewUrl: url };
          }),
        );
        await yieldToBrowser();
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [previewKey]);

  const remove = (id: string) => {
    setPages((list) => {
      const p = list.find((x) => x.id === id);
      if (p) {
        URL.revokeObjectURL(p.editUrl);
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      }
      const rest = list.filter((x) => x.id !== id);
      setSelected((s) => (s === id ? (rest[0]?.id ?? null) : s));
      return rest;
    });
  };
  const move = (id: string, by: -1 | 1) =>
    setPages((list) => {
      const i = list.findIndex((x) => x.id === id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const limitBytes = limit === "none" ? null : Number(limit) * KB;
  const resultKey = previewKey + `|${limit}`;
  const current = result?.key === resultKey ? result : null;

  const makePdf = async () => {
    if (!pages.length) return;
    setError(null);
    setResult(null);
    try {
      // Full-resolution pages, one at a time (each photo is decoded again, so only one large copy is in memory).
      const finals: HTMLCanvasElement[] = [];
      for (const [i, p] of pages.entries()) {
        setBusy({ label: `Scanning page ${i + 1} of ${pages.length}…`, progress: i / pages.length });
        await yieldToBrowser();
        const source = await decode(p.file, 3000);
        finals.push(toCanvas(render(source, p.quad, mode, p.turns, FINAL_SIDE)));
      }
      const encodeAll = async (scale: number, quality: number) => {
        const out: { image: PdfImage; placement: ReturnType<typeof placeImage> }[] = [];
        for (const c of finals) {
          let canvas = c;
          if (scale < 1) {
            canvas = document.createElement("canvas");
            canvas.width = Math.max(16, Math.round(c.width * scale));
            canvas.height = Math.max(16, Math.round(c.height * scale));
            const ctx = canvas.getContext("2d")!;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(c, 0, 0, canvas.width, canvas.height);
          }
          const jpeg = await blobOf(canvas, quality);
          out.push({
            image: { jpeg, width: canvas.width, height: canvas.height, colorSpace: "DeviceRGB" },
            placement: placeImage(canvas.width, canvas.height, { size: "a4", orientation: "auto", fit: "fit", margin: MARGINS.none }),
          });
        }
        return buildPdf(out);
      };
      setBusy({ label: "Making the PDF…", progress: 0.9 });
      let blob: Blob;
      let overLimit = false;
      if (limitBytes) {
        const search = await searchTargetSize(async (scale, q) => ({ blob: await encodeAll(scale, q), width: 0, height: 0 }), {
          targetBytes: limitBytes,
          allowResize: true,
          minScale: 600 / FINAL_SIDE,
          onProgress: (v) => setBusy({ label: `Fitting under ${formatBytes(limitBytes)}…`, progress: v }),
        });
        blob = search.attempt.blob;
        overLimit = search.outcome !== "met";
      } else {
        blob = await encodeAll(1, 0.85);
      }
      setResult({ key: resultKey, blob, url: URL.createObjectURL(blob), pages: finals.length, overLimit });
      track("document_scanned", { tool: TOOL, mode, count_bucket: countBucket(finals.length), target_kb: limitBytes ? Number(limit) : undefined });
    } catch {
      setError("The scan couldn't be finished. Try fewer pages or smaller photos.");
    } finally {
      setBusy(null);
    }
  };

  const page = pages.find((p) => p.id === selected) ?? null;

  const phoneTip = isPhone ? (
    <p className="text-sm text-muted">Tip: photograph the page with your camera app first, then choose the photo here.</p>
  ) : null;

  if (!pages.length) {
    return (
      <div id="prepare" className="scroll-mt-4 space-y-3">
        <ImageDropzone accept={[...ACCEPT]} onFiles={(f) => void addFiles(f)} loading={loading} prompt="Drop photos of your document (one per page)" maxFiles={MAX_PAGES} />
        {phoneTip}
        {error ? <Alert tone="error">{error}</Alert> : null}
      </div>
    );
  }

  return (
    <div id="prepare" className="scroll-mt-4 space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="corners-heading" className="min-w-0 space-y-3 rounded-lg border border-line bg-canvas p-4 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="corners-heading" className="text-base font-bold text-ink">
              {page ? `Page ${pages.indexOf(page) + 1}: drag the corners onto the page edges` : "Choose a page"}
            </h2>
            {page && !page.autoQuad ? <span className="text-xs text-muted">No page edge found automatically</span> : null}
          </div>
          {page ? (
            <>
              <CornerEditor page={page} onChange={(quad) => update(page.id, { quad })} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={buttonClass("secondary")} onClick={() => update(page.id, { turns: page.turns + 3 })}>
                  Rotate left
                </button>
                <button type="button" className={buttonClass("secondary")} onClick={() => update(page.id, { turns: page.turns + 1 })}>
                  Rotate right
                </button>
                {page.autoQuad ? (
                  <button type="button" className={buttonClass("secondary")} onClick={() => update(page.id, { quad: page.autoQuad! })}>
                    Auto-detect
                  </button>
                ) : null}
                <button type="button" className={buttonClass("secondary")} onClick={() => update(page.id, { quad: fullQuad(1, 1, 0) })}>
                  Whole photo
                </button>
              </div>
            </>
          ) : null}
        </section>

        <div className="min-w-0 space-y-4">
          <section aria-labelledby="pages-heading" className="rounded-lg border border-line bg-canvas p-4 shadow-sm">
            <h2 id="pages-heading" className="text-base font-bold text-ink">
              Pages ({pages.length})
            </h2>
            <ol className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3">
              {pages.map((p, i) => (
                <li key={p.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelected(p.id)}
                    aria-pressed={p.id === selected}
                    aria-label={`Page ${i + 1}`}
                    className={`block w-full overflow-hidden rounded border-2 bg-surface ${p.id === selected ? "border-accent" : "border-line"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                    <img src={p.previewUrl ?? p.editUrl} alt="" className="aspect-[3/4] w-full object-contain" />
                  </button>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span>{i + 1}</span>
                    <span className="flex gap-1">
                      <button type="button" aria-label={`Move page ${i + 1} up`} disabled={i === 0} onClick={() => move(p.id, -1)} className="min-h-8 min-w-8 rounded hover:bg-surface disabled:opacity-30">
                        ↑
                      </button>
                      <button type="button" aria-label={`Move page ${i + 1} down`} disabled={i === pages.length - 1} onClick={() => move(p.id, 1)} className="min-h-8 min-w-8 rounded hover:bg-surface disabled:opacity-30">
                        ↓
                      </button>
                      <button type="button" aria-label={`Delete page ${i + 1}`} onClick={() => remove(p.id)} className="min-h-8 min-w-8 rounded text-danger-ink hover:bg-surface">
                        ✕
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            {pages.length < MAX_PAGES ? (
              <div className="mt-3 space-y-2">
                <ImageDropzone accept={[...ACCEPT]} onFiles={(f) => void addFiles(f)} loading={loading} prompt="Add more pages" compact acceptHandOff={false} maxFiles={MAX_PAGES - pages.length} />
              </div>
            ) : null}
          </section>

          <section aria-label="Scan settings" className="space-y-4 rounded-lg border border-line bg-canvas p-4 shadow-sm">
            <Segmented<ScanMode>
              legend="Look"
              value={mode}
              onChange={setMode}
              options={[
                { value: "color", label: "Colour" },
                { value: "gray", label: "Grey" },
                { value: "bw", label: "Black & white" },
              ]}
            />
            <Segmented<Limit>
              legend="PDF size limit"
              value={limit}
              onChange={setLimit}
              options={[
                { value: "none", label: "No limit" },
                { value: "100", label: "100 KB" },
                { value: "200", label: "200 KB" },
                { value: "500", label: "500 KB" },
                { value: "1024", label: "1 MB" },
              ]}
            />
            <button type="button" className={buttonClass("primary", "w-full")} onClick={makePdf} disabled={Boolean(busy)}>
              {busy ? busy.label : current ? "Make the PDF again" : `Make PDF (${pages.length} page${pages.length > 1 ? "s" : ""})`}
            </button>
            {busy ? (
              <div className="h-1.5 overflow-hidden rounded bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(busy.progress * 100)}>
                <div className="h-full bg-accent transition-[width]" style={{ width: `${Math.round(busy.progress * 100)}%` }} />
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {current ? (
        <section aria-labelledby="scan-result" className="space-y-3 rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
          <h2 id="scan-result" className="text-lg font-bold text-ink">
            Your scanned PDF
          </h2>
          <p className="text-sm text-ink-soft">
            {current.pages} page{current.pages > 1 ? "s" : ""} · {formatBytes(current.blob.size)}
            {limitBytes ? (current.overLimit ? ` (the ${formatBytes(limitBytes)} limit couldn't be reached)` : ` (within ${formatBytes(limitBytes)})`) : ""}
          </p>
          {current.overLimit ? (
            <Alert tone="warning" title="Still over the limit">
              This is the smallest readable version. Remove pages, choose Black &amp; white, or use a larger limit.
            </Alert>
          ) : null}
          <DownloadButton href={current.url} fileName="scanned-document.pdf" label={`Download PDF (${formatBytes(current.blob.size)})`} tool={TOOL} outputFormat="pdf" />
        </section>
      ) : null}
    </div>
  );
}

/** The page photo with four draggable corner handles (pointer or arrow keys) and the outline between them. */
function CornerEditor({ page, onChange }: { page: Page; onChange: (q: Quad) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<number | null>(null);
  const { width: W, height: H } = page.edit;
  const px = page.quad.map((p) => ({ x: p.x * W, y: p.y * H }));
  const r = Math.max(W, H) * 0.028;

  const toFraction = useCallback(
    (clientX: number, clientY: number): Point => {
      const box = svgRef.current!.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (clientX - box.left) / box.width)), y: Math.min(1, Math.max(0, (clientY - box.top) / box.height)) };
    },
    [],
  );
  const set = (i: number, p: Point) => onChange(page.quad.map((c, j) => (j === i ? p : c)) as Quad);
  const names = ["Top-left", "Top-right", "Bottom-right", "Bottom-left"];

  return (
    // The box keeps the photo's exact shape: its width is the smaller of the column and what 70% of the screen height
    // allows. (Capping only the height made the photo stretch while the outline didn't, so corners looked off.)
    <div
      className="relative mx-auto select-none"
      style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, 36rem, calc(70vh * ${W / H}))` }}
      data-corner-editor
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local photo */}
      <img src={page.editUrl} alt="The photo of this page" className="absolute inset-0 h-full w-full rounded" draggable={false} />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerMove={(e) => {
          if (drag.current === null) return;
          set(drag.current, toFraction(e.clientX, e.clientY));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <polygon points={px.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgb(37 99 235 / 0.12)" stroke="rgb(37 99 235)" strokeWidth={r * 0.18} />
        {px.map((p, i) => (
          <g
            key={i}
            role="slider"
            tabIndex={0}
            aria-label={`${names[i]} corner`}
            aria-valuetext={`${Math.round(page.quad[i].x * 100)}% across, ${Math.round(page.quad[i].y * 100)}% down`}
            className="cursor-grab focus:outline-none"
            onPointerDown={(e) => {
              drag.current = i;
              (e.currentTarget.ownerSVGElement ?? svgRef.current)?.setPointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.05 : 0.01;
              const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
              if (!d) return;
              e.preventDefault();
              const c = page.quad[i];
              set(i, { x: Math.min(1, Math.max(0, c.x + d[0])), y: Math.min(1, Math.max(0, c.y + d[1])) });
            }}
          >
            <circle cx={p.x} cy={p.y} r={r * 2} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={r} fill="white" stroke="rgb(37 99 235)" strokeWidth={r * 0.3} className="[g:focus-visible>&]:stroke-[rgb(234_88_12)]" />
          </g>
        ))}
      </svg>
    </div>
  );
}
