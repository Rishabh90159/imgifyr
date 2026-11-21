/**
 * Document scanner geometry: find a sheet of paper in a photo, and flatten it (a perspective warp) into an upright
 * rectangle. Plain typed-array code, so it runs in any browser and is unit-tested without a canvas.
 */

export interface Point {
  x: number;
  y: number;
}

/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

export interface Raster {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const luma = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/** Otsu's threshold for a 256-bin histogram. */
export function otsu(hist: Uint32Array, total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

function area(q: Quad): number {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = q[i];
    const n = q[(i + 1) % 4];
    a += p.x * n.y - n.x * p.y;
  }
  return Math.abs(a) / 2;
}

function convex(q: Quad): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const c = q[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-9) return false;
    const s = Math.sign(cross);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

/**
 * Finds a light sheet on a darker surface: the largest bright region (Otsu threshold on brightness), whose four
 * extreme points become the corners. Returns null when no plausible sheet is found (then the whole photo is used).
 * Works on a small copy (a few hundred pixels across) for speed.
 */
export function detectSheet(img: Raster): Quad | null {
  const { width: w, height: h, data } = img;
  const n = w * h;
  const gray = new Uint8Array(n);
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const v = Math.round(luma(data, i * 4));
    gray[i] = v;
    hist[v]++;
  }
  const t = otsu(hist, n);
  // Largest 4-connected bright region.
  const label = new Int32Array(n).fill(-1);
  const stack = new Int32Array(n);
  let bestSize = 0;
  let bestLabel = -1;
  let next = 0;
  for (let start = 0; start < n; start++) {
    if (gray[start] <= t || label[start] !== -1) continue;
    let top = 0;
    stack[top++] = start;
    label[start] = next;
    let size = 0;
    while (top) {
      const p = stack[--top];
      size++;
      const x = p % w;
      const neighbours = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w];
      for (const q of neighbours) {
        if (q < 0 || q >= n || label[q] !== -1 || gray[q] <= t) continue;
        label[q] = next;
        stack[top++] = q;
      }
    }
    if (size > bestSize) {
      bestSize = size;
      bestLabel = next;
    }
    next++;
  }
  // A sheet covers a good part of the photo but not all of it (then there is no visible edge).
  if (bestLabel < 0 || bestSize < n * 0.12 || bestSize > n * 0.985) return null;
  let tl = { x: 0, y: 0, s: Infinity };
  let br = { x: 0, y: 0, s: -Infinity };
  let tr = { x: 0, y: 0, s: -Infinity };
  let bl = { x: 0, y: 0, s: Infinity };
  for (let p = 0; p < n; p++) {
    if (label[p] !== bestLabel) continue;
    const x = p % w;
    const y = (p - x) / w;
    if (x + y < tl.s) tl = { x, y, s: x + y };
    if (x + y > br.s) br = { x, y, s: x + y };
    if (x - y > tr.s) tr = { x, y, s: x - y };
    if (x - y < bl.s) bl = { x, y, s: x - y };
  }
  const quad: Quad = [
    { x: tl.x, y: tl.y },
    { x: tr.x + 1, y: tr.y },
    { x: br.x + 1, y: br.y + 1 },
    { x: bl.x, y: bl.y + 1 },
  ];
  if (!convex(quad) || area(quad) < n * 0.1) return null;
  return quad;
}

/** The whole picture, slightly inset, as a starting quad when no sheet is found. */
export function fullQuad(width: number, height: number, inset = 0): Quad {
  const ix = width * inset;
  const iy = height * inset;
  return [
    { x: ix, y: iy },
    { x: width - ix, y: iy },
    { x: width - ix, y: height - iy },
    { x: ix, y: height - iy },
  ];
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Output size for a quad: the longer of each pair of opposite edges, scaled so the long side is at most `maxSide`. */
export function flatSize(q: Quad, maxSide: number): { width: number; height: number } {
  const w = Math.max(dist(q[0], q[1]), dist(q[3], q[2]));
  const h = Math.max(dist(q[0], q[3]), dist(q[1], q[2]));
  const scale = Math.min(1, maxSide / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/**
 * The page's true width / height, recovered from the perspective of its four corners (Zhang & He, "Whiteboard
 * scanning and image enhancement"): a page photographed at an angle looks shorter than it is, so measuring its edges in
 * the photo squashes it (about 20% at a 25° tilt). The camera's focal length is estimated from the quad itself, with the
 * principal point at the photo's centre. Falls back to the measured edges when the photo shows no usable perspective.
 */
export function trueAspect(q: Quad, imageWidth: number, imageHeight: number): number {
  const edges = Math.max(dist(q[0], q[1]), dist(q[3], q[2])) / Math.max(dist(q[0], q[3]), dist(q[1], q[2]));
  // Corners as in the paper: m1 top-left, m2 top-right, m3 bottom-left, m4 bottom-right; centred on the principal point.
  const u0 = imageWidth / 2;
  const v0 = imageHeight / 2;
  const m = (p: Point) => [p.x, p.y, 1];
  const [m1, m2, m4, m3] = [m(q[0]), m(q[1]), m(q[2]), m(q[3])];
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const c14 = cross(m1, m4);
  const k2 = dot(c14, m3) / dot(cross(m2, m4), m3);
  const k3 = dot(c14, m2) / dot(cross(m3, m4), m2);
  const n2 = m2.map((v, i) => k2 * v - m1[i]);
  const n3 = m3.map((v, i) => k3 * v - m1[i]);
  if (!Number.isFinite(k2) || !Number.isFinite(k3)) return edges;
  // Nearly no perspective (a parallelogram): the plain ratio of the edge vectors is right.
  if (Math.abs(n2[2]) < 1e-9 && Math.abs(n3[2]) < 1e-9) {
    const r = Math.hypot(n2[0], n2[1]) / Math.hypot(n3[0], n3[1]);
    return Number.isFinite(r) && r > 0 ? r : edges;
  }
  // The focal length can be measured only when the page shows perspective in both directions. The usual photo is tilted
  // one way (top edge farther away), which leaves it undetermined, so a typical phone main camera is assumed instead:
  // about 26 mm-equivalent, i.e. a focal length of roughly 0.75 × the photo's long side. A measured value is used only when
  // it is reliable and plausible.
  const longSide = Math.max(imageWidth, imageHeight);
  const assumed = 0.75 * longSide;
  let f = assumed;
  if (Math.abs(n2[2]) > 0.02 && Math.abs(n3[2]) > 0.02) {
    const f2 =
      -(
        n2[0] * n3[0] - (n2[0] * n3[2] + n2[2] * n3[0]) * u0 + n2[2] * n3[2] * u0 * u0 +
        (n2[1] * n3[1] - (n2[1] * n3[2] + n2[2] * n3[1]) * v0 + n2[2] * n3[2] * v0 * v0)
      ) /
      (n2[2] * n3[2]);
    const measured = f2 > 0 ? Math.sqrt(f2) : 0;
    if (measured > 0.4 * longSide && measured < 2 * longSide) f = measured;
  }
  // |A⁻¹ n|² with A = [[f,0,u0],[0,f,v0],[0,0,1]].
  const norm = (n: number[]) => {
    const x = (n[0] - u0 * n[2]) / f;
    const y = (n[1] - v0 * n[2]) / f;
    return x * x + y * y + n[2] * n[2];
  };
  const r = Math.sqrt(norm(n2) / norm(n3));
  // Guard against wild estimates from a badly placed corner: stay within a sensible range of the measured shape.
  return Number.isFinite(r) && r > edges / 2.5 && r < edges * 2.5 ? r : edges;
}

/** A4's shape (portrait width / height). Shapes within 5% of A4, portrait or landscape, snap to it exactly. */
const A4 = 1 / Math.SQRT2;
export function snapToA4(aspect: number): number {
  if (Math.abs(aspect - A4) / A4 < 0.05) return A4;
  if (Math.abs(aspect - 1 / A4) / (1 / A4) < 0.05) return 1 / A4;
  return aspect;
}

/**
 * Output size of the flattened page: its true shape (perspective-corrected, A4 snapped), at the resolution the photo
 * gives it (the longer of each pair of opposite edges), with the long side at most `maxSide`.
 */
export function pageSize(q: Quad, imageWidth: number, imageHeight: number, maxSide: number): { width: number; height: number } {
  const aspect = snapToA4(trueAspect(q, imageWidth, imageHeight));
  const w0 = Math.max(dist(q[0], q[1]), dist(q[3], q[2]));
  const h0 = Math.max(dist(q[0], q[3]), dist(q[1], q[2]));
  // Keep the larger measured dimension and set the other from the true shape (never throwing detail away).
  let width = w0;
  let height = w0 / aspect;
  if (height < h0) {
    height = h0;
    width = h0 * aspect;
  }
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Homography (3×3, h33 = 1) mapping the output rectangle (0,0)–(W,H) onto the quad in the source. */
export function rectToQuad(W: number, H: number, q: Quad): number[] {
  const src: Point[] = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ];
  // Solve the 8×8 system A·h = b by Gaussian elimination with partial pivoting.
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {
    let pivot = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[pivot][c])) pivot = r;
    [A[c], A[pivot]] = [A[pivot], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  const h = A.map((row, i) => row[8] / row[i]);
  return [...h, 1];
}

/** Flattens the quad of `src` into a width × height RGBA image, with bilinear sampling. */
export function warp(src: Raster, q: Quad, width: number, height: number): Raster {
  const H = rectToQuad(width, height, q);
  const out = new Uint8ClampedArray(width * height * 4);
  const sw = src.width;
  const sh = src.height;
  const s = src.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const X = x + 0.5;
      const Y = y + 0.5;
      const d = H[6] * X + H[7] * Y + H[8];
      let u = (H[0] * X + H[1] * Y + H[2]) / d - 0.5;
      let v = (H[3] * X + H[4] * Y + H[5]) / d - 0.5;
      u = Math.min(Math.max(u, 0), sw - 1);
      v = Math.min(Math.max(v, 0), sh - 1);
      const x0 = Math.floor(u);
      const y0 = Math.floor(v);
      const x1 = Math.min(x0 + 1, sw - 1);
      const y1 = Math.min(y0 + 1, sh - 1);
      const fx = u - x0;
      const fy = v - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const o = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = s[i00 + c] + (s[i10 + c] - s[i00 + c]) * fx;
        const bottom = s[i01 + c] + (s[i11 + c] - s[i01 + c]) * fx;
        out[o + c] = top + (bottom - top) * fy;
      }
      out[o + 3] = 255;
    }
  }
  return { data: out, width, height };
}
