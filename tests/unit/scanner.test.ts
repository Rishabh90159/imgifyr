import { describe, expect, it } from "vitest";
import { enhance, rotate } from "@/lib/scanner/enhance";
import { detectSheet, flatSize, fullQuad, pageSize, rectToQuad, snapToA4, trueAspect, warp, type Quad, type Raster } from "@/lib/scanner/geometry";

function raster(width: number, height: number, paint: (x: number, y: number) => number | [number, number, number]): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = paint(x, y);
      const [r, g, b] = typeof v === "number" ? [v, v, v] : v;
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

/** Is (x, y) inside the convex quad? */
function inside(q: Quad, x: number, y: number): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const s = Math.sign((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x));
    if (s === 0) continue;
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

const tilted: Quad = [
  { x: 70, y: 40 },
  { x: 250, y: 60 },
  { x: 235, y: 330 },
  { x: 50, y: 310 },
];
const photo = raster(300, 380, (x, y) => (inside(tilted, x, y) ? [235, 230, 215] : [70, 55, 45]));

describe("detectSheet", () => {
  it("finds the corners of a tilted sheet on a dark table", () => {
    const q = detectSheet(photo)!;
    expect(q).not.toBeNull();
    for (let i = 0; i < 4; i++) {
      expect(Math.hypot(q[i].x - tilted[i].x, q[i].y - tilted[i].y)).toBeLessThan(6);
    }
  });

  it("gives up (null) when there is no sheet edge to find", () => {
    expect(detectSheet(raster(200, 200, () => 240))).toBeNull();
    expect(detectSheet(raster(200, 200, (x) => (x % 7 ? 30 : 230)))).toBeNull();
  });
});

describe("warp", () => {
  it("maps the output rectangle's corners onto the quad", () => {
    const H = rectToQuad(100, 200, tilted);
    const at = (x: number, y: number) => {
      const d = H[6] * x + H[7] * y + H[8];
      return { x: (H[0] * x + H[1] * y + H[2]) / d, y: (H[3] * x + H[4] * y + H[5]) / d };
    };
    for (const [p, q] of [
      [at(0, 0), tilted[0]],
      [at(100, 0), tilted[1]],
      [at(100, 200), tilted[2]],
      [at(0, 200), tilted[3]],
    ]) {
      expect(p.x).toBeCloseTo(q.x, 6);
      expect(p.y).toBeCloseTo(q.y, 6);
    }
  });

  it("flattens the sheet so the result is all paper, no table", () => {
    const size = flatSize(tilted, 1000);
    const flat = warp(photo, tilted, size.width, size.height);
    let dark = 0;
    for (let i = 0; i < flat.data.length; i += 4) if (flat.data[i] < 150) dark++;
    // Only the anti-aliased edge may touch the table.
    expect(dark / (flat.width * flat.height)).toBeLessThan(0.02);
    expect(size.height).toBeGreaterThan(size.width);
  });

  it("caps the long side", () => {
    expect(Math.max(flatSize(fullQuad(4000, 3000), 2000).width, flatSize(fullQuad(4000, 3000), 2000).height)).toBe(2000);
  });
});

/** Corners of a W × H mm page tilted `tiltDeg` away from a camera (focal f px), as they appear in a cw × ch photo. */
function photographed(W: number, H: number, tiltDeg: number, opts: { f?: number; cw?: number; ch?: number; dist?: number; shiftX?: number } = {}): Quad {
  const { f = 2800, cw = 3000, ch = 4000, dist = 420, shiftX = 0 } = opts;
  const t = (tiltDeg * Math.PI) / 180;
  return ([
    [-W / 2, -H / 2],
    [W / 2, -H / 2],
    [W / 2, H / 2],
    [-W / 2, H / 2],
  ] as const).map(([x, y]) => {
    const yy = y * Math.cos(t);
    const zz = dist + y * Math.sin(t);
    return { x: cw / 2 + (f * (x + shiftX)) / zz, y: ch / 2 + (f * yy) / zz };
  }) as Quad;
}

describe("page shape", () => {
  it("recovers an A4 page's true shape when photographed at an angle (the old edge method squashed it)", () => {
    for (const tilt of [10, 25, 35]) {
      const q = photographed(210, 297, tilt);
      // Within 3% before snapping (the focal length is assumed when the tilt is one-way), exactly A4 after.
      expect(Math.abs(trueAspect(q, 3000, 4000) / (210 / 297) - 1)).toBeLessThan(0.03);
      const size = pageSize(q, 3000, 4000, 2200);
      expect(size.height / size.width).toBeCloseTo(Math.SQRT2, 2);
      // What the old method gave: noticeably too short.
      const old = flatSize(q, 2200);
      if (tilt >= 25) expect(old.height / old.width).toBeLessThan(1.25);
    }
  });

  it("works for an off-centre page and for a page shot from straight above", () => {
    expect(Math.abs(trueAspect(photographed(210, 297, 20, { shiftX: 60 }), 3000, 4000) / (210 / 297) - 1)).toBeLessThan(0.03);
    expect(trueAspect(photographed(210, 297, 0), 3000, 4000)).toBeCloseTo(210 / 297, 3);
  });

  it("keeps non-A4 shapes (an ID card) and only snaps near-A4 shapes", () => {
    const card = pageSize(photographed(85.6, 54, 20, { dist: 250 }), 3000, 4000, 2000);
    expect(Math.abs(card.width / card.height / (85.6 / 54) - 1)).toBeLessThan(0.03);
    expect(snapToA4(0.69)).toBeCloseTo(1 / Math.SQRT2, 6);
    expect(snapToA4(1.45)).toBeCloseTo(Math.SQRT2, 6);
    expect(snapToA4(0.6)).toBe(0.6);
  });
});

describe("enhance", () => {
  it("Original leaves the colours untouched", () => {
    const img = raster(20, 20, (x) => [x * 10, 120, 200 - x * 5]);
    expect(enhance(img, "original").data).toEqual(img.data);
  });

  // Grey paper with a shadow across the right half, and a band of dark "text".
  const page = raster(240, 320, (x, y) => {
    const paper = x < 120 ? 190 : 120;
    return y > 150 && y < 160 && x > 20 && x < 220 ? Math.round(paper * 0.25) : paper;
  });
  const at = (img: Raster, x: number, y: number) => img.data[(y * img.width + x) * 4];

  it("black & white: shadowed and lit paper both become white, text black", () => {
    const bw = enhance(page, "bw");
    expect(at(bw, 60, 60)).toBe(255);
    expect(at(bw, 180, 60)).toBe(255);
    expect(at(bw, 60, 155)).toBe(0);
    expect(at(bw, 180, 155)).toBe(0);
  });

  it("colour and grey: paper whitened, text stays clearly darker", () => {
    for (const mode of ["color", "gray"] as const) {
      const out = enhance(page, mode);
      expect(at(out, 180, 60)).toBeGreaterThan(240);
      expect(at(out, 180, 155)).toBeLessThan(80);
    }
  });

  it("colour mode turns cream paper white but keeps a red stamp red", () => {
    const cream = raster(160, 160, (x, y) => (x > 60 && x < 100 && y > 60 && y < 100 ? [200, 40, 40] : [230, 215, 180]));
    const out = enhance(cream, "color");
    const px = (x: number, y: number) => Array.from(out.data.slice((y * 160 + x) * 4, (y * 160 + x) * 4 + 3));
    const [r, g, b] = px(20, 20);
    expect(Math.min(r, g, b)).toBeGreaterThan(245);
    const [sr, sg] = px(80, 80);
    expect(sr - sg).toBeGreaterThan(80);
  });

  it("keeps colour in colour mode", () => {
    const blueInk = raster(120, 120, (x, y) => (y > 50 && y < 60 ? [30, 40, 160] : [200, 200, 200]));
    const out = enhance(blueInk, "color");
    const i = (55 * 120 + 60) * 4;
    expect(out.data[i + 2]).toBeGreaterThan(out.data[i] + 60);
  });
});

describe("rotate", () => {
  it("turns a page a quarter clockwise", () => {
    const img = raster(3, 2, (x, y) => (x === 0 && y === 0 ? 10 : 200));
    const r = rotate(img, 1);
    expect([r.width, r.height]).toEqual([2, 3]);
    expect(r.data[(0 * 2 + 1) * 4]).toBe(10);
    expect(rotate(rotate(img, 1), 3).data).toEqual(img.data);
  });
});
