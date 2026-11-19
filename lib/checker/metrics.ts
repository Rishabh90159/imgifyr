/**
 * Simple, explainable measurements on decoded pixels, shared by the photo checker and live photo practice.
 * Everything runs in the browser on a small copy of the image (a few hundred pixels wide), so it is fast and
 * nothing leaves the device. Thresholds are deliberately lenient: these are hints, not an exam body's verdict.
 */

export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Rec. 601 luma, 0–255. */
export function luma(data: Uint8ClampedArray, i: number): number {
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}

function clampRect(px: Pixels, r: Rect): Rect {
  const x = Math.max(0, Math.floor(r.x));
  const y = Math.max(0, Math.floor(r.y));
  return { x, y, width: Math.max(1, Math.min(px.width - x, Math.floor(r.width))), height: Math.max(1, Math.min(px.height - y, Math.floor(r.height))) };
}

/** Mean and standard deviation of brightness inside one or more rectangles. */
export function lumaStats(px: Pixels, rects: Rect[]): { mean: number; std: number } {
  let n = 0;
  let sum = 0;
  let sq = 0;
  for (const raw of rects) {
    const r = clampRect(px, raw);
    for (let y = r.y; y < r.y + r.height; y++) {
      for (let x = r.x; x < r.x + r.width; x++) {
        const v = luma(px.data, (y * px.width + x) * 4);
        sum += v;
        sq += v * v;
        n++;
      }
    }
  }
  const mean = n ? sum / n : 0;
  return { mean, std: n ? Math.sqrt(Math.max(0, sq / n - mean * mean)) : 0 };
}

/**
 * Sharpness: variance of the Laplacian of brightness inside `rect`. Low values mean few edges (blur, or a very
 * plain area). Comparable only between images scaled to a similar size.
 */
export function sharpness(px: Pixels, rect?: Rect): number {
  const r = clampRect(px, rect ?? { x: 0, y: 0, width: px.width, height: px.height });
  const w = px.width;
  let n = 0;
  let sum = 0;
  let sq = 0;
  for (let y = Math.max(1, r.y); y < Math.min(px.height - 1, r.y + r.height); y++) {
    for (let x = Math.max(1, r.x); x < Math.min(w - 1, r.x + r.width); x++) {
      const c = luma(px.data, (y * w + x) * 4);
      const lap =
        luma(px.data, ((y - 1) * w + x) * 4) + luma(px.data, ((y + 1) * w + x) * 4) + luma(px.data, (y * w + x - 1) * 4) + luma(px.data, (y * w + x + 1) * 4) - 4 * c;
      sum += lap;
      sq += lap * lap;
      n++;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return sq / n - mean * mean;
}

/** The outer band of the picture (top corners and sides), where a portrait photo shows its background. */
export function backgroundBands(px: Pixels): Rect[] {
  const bw = Math.max(1, Math.round(px.width * 0.12));
  const bh = Math.max(1, Math.round(px.height * 0.5));
  return [
    { x: 0, y: 0, width: bw, height: bh },
    { x: px.width - bw, y: 0, width: bw, height: bh },
    { x: bw, y: 0, width: px.width - 2 * bw, height: Math.max(1, Math.round(px.height * 0.06)) },
  ];
}

/** Where a head-and-shoulders photo usually has the face: the middle of the upper part. */
export function faceArea(px: Pixels): Rect {
  return { x: px.width * 0.3, y: px.height * 0.18, width: px.width * 0.4, height: px.height * 0.42 };
}

export interface PhotoMetrics {
  /** Brightness where the face usually is. */
  face: number;
  /** Background band brightness and how uneven it is (patterns, objects). */
  background: { mean: number; std: number };
  /** Laplacian variance in the face area. */
  sharpness: number;
  /** Brightness difference between the left and right half of the face area (0–1). */
  sideImbalance: number;
}

export function photoMetrics(px: Pixels): PhotoMetrics {
  const f = faceArea(px);
  const left = lumaStats(px, [{ ...f, width: f.width / 2 }]).mean;
  const right = lumaStats(px, [{ ...f, x: f.x + f.width / 2, width: f.width / 2 }]).mean;
  return {
    face: lumaStats(px, [f]).mean,
    background: lumaStats(px, backgroundBands(px)),
    sharpness: sharpness(px, f),
    sideImbalance: Math.abs(left - right) / Math.max(1, Math.max(left, right)),
  };
}

export interface SignatureMetrics {
  /** Share of pixels darker than the ink threshold. */
  inkShare: number;
  /** Bounding box of the ink as fractions of the image (0–1), or null when no ink was found. */
  inkBox: Rect | null;
  /** Median brightness of the ink pixels (lower is darker). */
  inkLevel: number;
  /** Mean brightness of the paper (non-ink) pixels. */
  paper: number;
}

/** Pixels darker than this count as ink. */
const INK = 120;

export function signatureMetrics(px: Pixels): SignatureMetrics {
  const { width, height, data } = px;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let ink = 0;
  let paperSum = 0;
  const hist = new Uint32Array(256);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = luma(data, (y * width + x) * 4);
      if (v < INK) {
        ink++;
        hist[Math.round(v)]++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else paperSum += v;
    }
  }
  const total = width * height;
  let inkLevel = 255;
  if (ink) {
    let seen = 0;
    for (let v = 0; v < 256; v++) {
      seen += hist[v];
      if (seen >= ink / 2) {
        inkLevel = v;
        break;
      }
    }
  }
  return {
    inkShare: ink / total,
    inkBox: ink ? { x: minX / width, y: minY / height, width: (maxX - minX + 1) / width, height: (maxY - minY + 1) / height } : null,
    inkLevel,
    paper: total - ink ? paperSum / (total - ink) : 0,
  };
}
