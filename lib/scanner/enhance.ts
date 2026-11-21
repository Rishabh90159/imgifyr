import type { Raster } from "./geometry";

/**
 * Makes a flattened page look scanned. The paper's own brightness is estimated in blocks (the brightest part of
 * each block, smoothed), and every pixel is divided by it: shadows, a yellow lamp and grey paper all become white,
 * while ink keeps its contrast. "bw" then turns the result into crisp black ink on white.
 */
/** "original" only straightens and crops: the photo's own colours, untouched. */
export type ScanMode = "original" | "color" | "gray" | "bw";

const luma = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/** Paper brightness per block (95th percentile of luma), smoothed, as a small grid. */
function paperGrid(img: Raster, block: number): { grid: Float32Array; gw: number; gh: number } {
  const gw = Math.max(1, Math.ceil(img.width / block));
  const gh = Math.max(1, Math.ceil(img.height / block));
  const grid = new Float32Array(gw * gh);
  const hist = new Uint32Array(256);
  for (let by = 0; by < gh; by++) {
    for (let bx = 0; bx < gw; bx++) {
      hist.fill(0);
      let n = 0;
      const x1 = Math.min(img.width, (bx + 1) * block);
      const y1 = Math.min(img.height, (by + 1) * block);
      for (let y = by * block; y < y1; y++) {
        for (let x = bx * block; x < x1; x++) {
          hist[Math.round(luma(img.data, (y * img.width + x) * 4))]++;
          n++;
        }
      }
      let seen = 0;
      let p95 = 255;
      for (let v = 0; v < 256; v++) {
        seen += hist[v];
        if (seen >= n * 0.95) {
          p95 = v;
          break;
        }
      }
      grid[by * gw + bx] = p95;
    }
  }
  // A block that is all ink (a photo, a big stamp) reads too dark: let its neighbours' paper level win, then smooth.
  const lifted = new Float32Array(grid);
  for (let pass = 0; pass < 2; pass++) {
    const src = pass ? new Float32Array(lifted) : grid;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        let max = 0;
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
            const v = src[yy * gw + xx];
            max = Math.max(max, v);
            sum += v;
            n++;
          }
        }
        lifted[y * gw + x] = pass === 0 ? Math.max(src[y * gw + x], max * 0.92) : sum / n;
      }
    }
  }
  return { grid: lifted, gw, gh };
}

export function enhance(img: Raster, mode: ScanMode): Raster {
  if (mode === "original") return img;
  const { width, height, data } = img;
  const block = Math.max(12, Math.round(Math.max(width, height) / 32));
  const { grid, gw, gh } = paperGrid(img, block);
  const out = new Uint8ClampedArray(data.length);
  const paperAt = (x: number, y: number) => {
    const gy = Math.min(Math.max((y + 0.5) / block - 0.5, 0), gh - 1);
    const gx = Math.min(Math.max((x + 0.5) / block - 0.5, 0), gw - 1);
    const y0 = Math.floor(gy);
    const x0 = Math.floor(gx);
    const y1 = Math.min(y0 + 1, gh - 1);
    const x1 = Math.min(x0 + 1, gw - 1);
    const top = grid[y0 * gw + x0] + (grid[y0 * gw + x1] - grid[y0 * gw + x0]) * (gx - x0);
    const bottom = grid[y1 * gw + x0] + (grid[y1 * gw + x1] - grid[y1 * gw + x0]) * (gx - x0);
    return Math.max(40, top + (bottom - top) * (gy - y0));
  };
  // Colour mode also white-balances: the average colour of the paper (pixels at paper brightness) becomes neutral,
  // so cream paper or a yellow lamp comes out white, as a scanner would.
  const balance = [1, 1, 1];
  if (mode === "color") {
    const sum = [0, 0, 0];
    let n = 0;
    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const i = (y * width + x) * 4;
        const gain = 255 / paperAt(x, y);
        if (luma(data, i) * gain < 235) continue;
        for (let c = 0; c < 3; c++) sum[c] += data[i + c] * gain;
        n++;
      }
    }
    if (n > 50) {
      const mean = sum.map((s) => s / n);
      const target = (mean[0] + mean[1] + mean[2]) / 3;
      for (let c = 0; c < 3; c++) balance[c] = Math.min(1.3, Math.max(0.77, target / Math.max(1, mean[c])));
    }
  }
  for (let y = 0; y < height; y++) {
    const gy = Math.min(Math.max((y + 0.5) / block - 0.5, 0), gh - 1);
    const y0 = Math.floor(gy);
    const y1 = Math.min(y0 + 1, gh - 1);
    const fy = gy - y0;
    for (let x = 0; x < width; x++) {
      const gx = Math.min(Math.max((x + 0.5) / block - 0.5, 0), gw - 1);
      const x0 = Math.floor(gx);
      const x1 = Math.min(x0 + 1, gw - 1);
      const fx = gx - x0;
      const top = grid[y0 * gw + x0] + (grid[y0 * gw + x1] - grid[y0 * gw + x0]) * fx;
      const bottom = grid[y1 * gw + x0] + (grid[y1 * gw + x1] - grid[y1 * gw + x0]) * fx;
      const paper = Math.max(40, top + (bottom - top) * fy);
      const i = (y * width + x) * 4;
      const gain = 255 / paper;
      if (mode === "color") {
        for (let c = 0; c < 3; c++) {
          // Paper to white, then a little extra contrast for faded ink.
          const v = data[i + c] * gain * balance[c];
          out[i + c] = Math.min(255, Math.max(0, (v - 25) * (255 / 230)));
        }
      } else {
        const v = luma(data, i) * gain;
        const g = mode === "gray" ? (v - 25) * (255 / 230) : (v - 150) * (255 / 60);
        const clamped = Math.min(255, Math.max(0, g));
        out[i] = out[i + 1] = out[i + 2] = clamped;
      }
      out[i + 3] = 255;
    }
  }
  return { data: out, width, height };
}

/** Rotates by quarter turns (clockwise). */
export function rotate(img: Raster, quarterTurns: number): Raster {
  const t = ((quarterTurns % 4) + 4) % 4;
  if (!t) return img;
  const { width: w, height: h, data } = img;
  const ow = t % 2 ? h : w;
  const oh = t % 2 ? w : h;
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [nx, ny] = t === 1 ? [h - 1 - y, x] : t === 2 ? [w - 1 - x, h - 1 - y] : [y, w - 1 - x];
      const s = (y * w + x) * 4;
      const d = (ny * ow + nx) * 4;
      out[d] = data[s];
      out[d + 1] = data[s + 1];
      out[d + 2] = data[s + 2];
      out[d + 3] = data[s + 3];
    }
  }
  return { data: out, width: ow, height: oh };
}
