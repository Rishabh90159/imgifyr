import { describe, expect, it } from "vitest";
import { checkFile, checkPhoto, checkSignature, type FileFacts } from "@/lib/checker/check";
import { assessFrame, faceBox } from "@/lib/checker/live";
import { photoMetrics, sharpness, signatureMetrics, type Pixels } from "@/lib/checker/metrics";
import type { ImageSpec } from "@/lib/requirements/types";

/** A synthetic image: `paint(x, y)` returns a grey level (or RGB). */
function image(width: number, height: number, paint: (x: number, y: number) => number | [number, number, number]): Pixels {
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

/** A lit "face" with texture on a plain light wall. */
const portrait = (wall: (x: number, y: number) => number, face: (x: number, y: number) => number) =>
  image(300, 400, (x, y) => {
    const dx = (x - 150) / 70;
    const dy = (y - 160) / 95;
    return dx * dx + dy * dy < 1 ? face(x, y) : wall(x, y);
  });
const textured = (base: number) => (x: number, y: number) => base + ((x * 7 + y * 13) % 5 === 0 ? 40 : 0) - ((x + y) % 3 === 0 ? 25 : 0);

const PAN: ImageSpec = { kind: "photo", format: "JPEG", widthPx: 197, heightPx: 276, pixelBasis: "derived", aspect: 197 / 276, dpi: 200, maxKB: 20, rules: ["x"] };
const jpg = (over: Partial<FileFacts> = {}): FileFacts => ({ name: "photo.jpg", bytes: 15 * 1024, detected: "image/jpeg", width: 197, height: 276, orientation: 1, dpi: 200, ...over });
const verdict = (list: ReturnType<typeof checkFile>, id: string) => list.find((f) => f.id === id)?.verdict;

describe("checkFile", () => {
  it("passes a file that meets every measured limit", () => {
    expect(checkFile(jpg(), PAN).every((f) => f.verdict === "pass")).toBe(true);
  });

  it("catches a PNG renamed to .jpg and sends it to the converter", () => {
    const r = checkFile(jpg({ detected: "image/png" }), PAN);
    expect(verdict(r, "type")).toBe("fail");
    expect(r.find((f) => f.id === "type")!.fix).toBe("image-to-jpg");
    expect(r.find((f) => f.id === "type")!.detail).toMatch(/really a PNG/);
  });

  it("sends an iPhone HEIC to the HEIC converter", () => {
    expect(checkFile(jpg({ name: "IMG_1.HEIC", detected: "image/heic" }), PAN).find((f) => f.id === "type")!.fix).toBe("heic-to-jpg");
  });

  it("fails wrong pixels and spots a sideways photo", () => {
    const r = checkFile(jpg({ width: 276, height: 197 }), PAN);
    expect(verdict(r, "pixels")).toBe("fail");
    expect(r.find((f) => f.id === "pixels")!.detail).toMatch(/turned sideways/);
  });

  it("fails a file over the KB limit and one under the minimum", () => {
    expect(verdict(checkFile(jpg({ bytes: 25 * 1024 }), PAN), "kb")).toBe("fail");
    expect(verdict(checkFile(jpg({ bytes: 5 * 1024 }), { ...PAN, minKB: 10 }), "kb")).toBe("fail");
  });

  it("only warns on DPI and rotation tags", () => {
    const r = checkFile(jpg({ dpi: 72, orientation: 6 }), PAN);
    expect(verdict(r, "dpi")).toBe("warn");
    expect(verdict(r, "rotation")).toBe("warn");
  });

  it("checks the shape when the form states only a print size", () => {
    const ctet: ImageSpec = { kind: "photo", physical: "3.5 cm × 4.5 cm", aspect: 3.5 / 4.5, rules: ["x"] };
    expect(verdict(checkFile(jpg({ width: 350, height: 450 }), ctet), "pixels")).toBe("pass");
    expect(verdict(checkFile(jpg({ width: 400, height: 400 }), ctet), "pixels")).toBe("fail");
  });

  it("without a form, only warns about non-JPG files", () => {
    expect(verdict(checkFile(jpg({ name: "a.png", detected: "image/png" })), "type")).toBe("warn");
  });
});

describe("photo hints", () => {
  it("a lit, textured face on a plain light wall passes", () => {
    const r = checkPhoto(photoMetrics(portrait(() => 235, textured(170))), true);
    expect(r.every((f) => f.verdict === "pass")).toBe(true);
  });

  it("flags a dark face and a busy background", () => {
    const dark = checkPhoto(photoMetrics(portrait(() => 235, textured(40))), true);
    expect(dark.find((f) => f.id === "light")!.verdict).toBe("warn");
    const busy = checkPhoto(photoMetrics(portrait((x) => (Math.floor(x / 6) % 2 ? 250 : 60), textured(170))), true);
    expect(busy.find((f) => f.id === "background")!.verdict).toBe("warn");
  });

  it("flags a flat, featureless (blurred) face", () => {
    expect(checkPhoto(photoMetrics(image(300, 400, () => 170)), false).find((f) => f.id === "sharp")!.verdict).toBe("warn");
    expect(sharpness(portrait(() => 235, textured(170)))).toBeGreaterThan(12);
  });
});

describe("signature hints", () => {
  const sig = (inkW: number, inkH: number, paper = 250, ink = 20) =>
    image(400, 160, (x, y) => (Math.abs(x - 200) < inkW / 2 && Math.abs(y - 80) < inkH / 2 && (x + y) % 4 === 0 ? ink : paper));

  it("a signature filling the image on white paper passes", () => {
    expect(checkSignature(signatureMetrics(sig(360, 120)), false).every((f) => f.verdict === "pass")).toBe(true);
  });

  it("flags a miniature signature, citing the form's rule when it has one", () => {
    const r = checkSignature(signatureMetrics(sig(80, 30)), true);
    expect(r.find((f) => f.id === "ink")!.verdict).toBe("warn");
    expect(r.find((f) => f.id === "ink")!.detail).toMatch(/miniature signatures are rejected/);
  });

  it("flags grey paper, faint ink and an empty image", () => {
    expect(checkSignature(signatureMetrics(sig(360, 120, 170)), false).find((f) => f.id === "paper")!.verdict).toBe("warn");
    expect(checkSignature(signatureMetrics(sig(360, 120, 250, 110)), false).find((f) => f.id === "faint")!.verdict).toBe("warn");
    expect(checkSignature(signatureMetrics(image(100, 50, () => 250)), false)[0].verdict).toBe("fail");
  });
});

describe("live frame", () => {
  const W = 192;
  const H = 144;
  const box = faceBox(W, H);
  const frame = (wall: number, face: number) =>
    image(W, H, (x, y) => {
      const inBox = x > box.x * W && x < (box.x + box.width) * W && y > box.y * H && y < (box.y + box.height) * H;
      return inBox ? textured(face)(x, y) : wall;
    });

  it("a lit face against a plain wall passes", () => {
    expect(assessFrame(frame(200, 170), box, undefined).every((f) => f.verdict === "pass")).toBe(true);
  });

  it("detects back light and darkness", () => {
    expect(assessFrame(frame(250, 90), box, undefined).find((f) => f.id === "backlight")).toBeTruthy();
    expect(assessFrame(frame(60, 50), box, undefined).find((f) => f.id === "light")!.verdict).toBe("warn");
  });

  it("uses the face detector's box when there is one", () => {
    const ok = { x: box.x + box.width * 0.25, y: box.y + box.height * 0.1, width: box.width * 0.5, height: box.height * 0.4 };
    expect(assessFrame(frame(200, 170), box, ok).find((f) => f.id === "face")!.verdict).toBe("pass");
    expect(assessFrame(frame(200, 170), box, { ...ok, width: box.width * 0.2 }).find((f) => f.id === "face")!.detail).toMatch(/closer/);
    expect(assessFrame(frame(200, 170), box, null).find((f) => f.id === "face")!.verdict).toBe("warn");
    expect(assessFrame(frame(200, 170), box, undefined).find((f) => f.id === "face")).toBeUndefined();
  });

  it("keeps the face box a portrait shape inside the frame", () => {
    const b = faceBox(1280, 720);
    expect((b.width * 1280) / (b.height * 720)).toBeCloseTo(3.5 / 4.5, 2);
    expect(b.x).toBeGreaterThan(0);
  });
});
