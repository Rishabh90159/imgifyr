import { describe, expect, it } from "vitest";
import { formatPhotoDate, stripLayout } from "@/lib/image-processing/caption";
import { printSize, readImageDpi, setImageDpi } from "@/lib/image-processing/dpi";
import { mergeLayout } from "@/lib/image-processing/merge-layout";
import { crc32 } from "@/lib/utils/crc32";

const SCAN = [0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x12, 0x34, 0x56, 0xff, 0xd9];

function jfif(units: number, density: number): number[] {
  return [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, units, density >> 8, density & 0xff, density >> 8, density & 0xff, 0, 0];
}

/** EXIF APP1 with IFD0 XResolution, YResolution and ResolutionUnit. */
function exif(little: boolean, x: number, unit: number): number[] {
  const tiff: number[] = [];
  const p16 = (v: number) => (little ? [v & 0xff, v >> 8] : [v >> 8, v & 0xff]);
  const p32 = (v: number) => (little ? [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24] : [v >>> 24, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]);
  tiff.push(...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...p16(42), ...p32(8));
  const values = 8 + 2 + 3 * 12 + 4; // rationals stored after the directory
  tiff.push(...p16(3));
  tiff.push(...p16(0x011a), ...p16(5), ...p32(1), ...p32(values));
  tiff.push(...p16(0x011b), ...p16(5), ...p32(1), ...p32(values + 8));
  tiff.push(...p16(0x0128), ...p16(3), ...p32(1), ...p16(unit), 0, 0);
  tiff.push(...p32(0));
  tiff.push(...p32(x), ...p32(1), ...p32(x), ...p32(1));
  const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const length = body.length + 2;
  return [0xff, 0xe1, length >> 8, length & 0xff, ...body];
}

function jpeg(...segments: number[][]): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, ...segments.flat(), ...SCAN]);
}

function png(withPhys?: number): Uint8Array {
  const chunk = (type: string, data: number[]) => {
    const out = new Uint8Array(12 + data.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    view.setUint32(8 + data.length, crc32(out, 4, 8 + data.length));
    return [...out];
  };
  const ppm = withPhys ? Math.round(withPhys / 0.0254) : 0;
  const be32 = (v: number) => [v >>> 24, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  return Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunk("IHDR", [...be32(2), ...be32(2), 8, 2, 0, 0, 0]),
    ...(withPhys ? chunk("pHYs", [...be32(ppm), ...be32(ppm), 1]) : []),
    ...chunk("IDAT", [1, 2, 3, 4]),
    ...chunk("IEND", []),
  ]);
}

/** Bytes from the start-of-scan marker on: the compressed picture, which must never change. */
function scanOf(b: Uint8Array): number[] {
  for (let i = 0; i < b.length - 1; i++) if (b[i] === 0xff && b[i + 1] === 0xda) return [...b.subarray(i)];
  return [];
}

describe("readImageDpi / setImageDpi", () => {
  it("reads and writes the JFIF density, keeping the image data", () => {
    const file = jpeg(jfif(1, 72));
    expect(readImageDpi(file)).toEqual({ dpi: 72, source: "jfif" });
    const out = setImageDpi(file, 300);
    expect(readImageDpi(out)).toEqual({ dpi: 300, source: "jfif" });
    expect(out.length).toBe(file.length);
    expect(scanOf(out)).toEqual(scanOf(file));
  });

  it("converts dots per centimetre to DPI", () => {
    expect(readImageDpi(jpeg(jfif(2, 118))).dpi).toBe(299.7);
  });

  it("treats a JFIF aspect-ratio-only header as no DPI", () => {
    expect(readImageDpi(jpeg(jfif(0, 1)))).toEqual({ dpi: null, source: null });
  });

  for (const little of [true, false]) {
    it(`updates EXIF resolution (${little ? "little" : "big"}-endian) as well as adding JFIF`, () => {
      const file = jpeg(exif(little, 72, 2));
      expect(readImageDpi(file)).toEqual({ dpi: 72, source: "exif" });
      const out = setImageDpi(file, 200);
      // EXIF is what Windows and Photoshop show, so it must carry the new value too.
      expect(readImageDpi(out)).toEqual({ dpi: 200, source: "exif" });
      // A JFIF header is added right after SOI, so readers that ignore EXIF see it too.
      expect(readImageDpi(Uint8Array.from([...out.subarray(0, 20), ...SCAN]))).toEqual({ dpi: 200, source: "jfif" });
      expect(scanOf(out)).toEqual(scanOf(file));
    });
  }

  it("reads EXIF resolution in centimetres and rewrites the unit to inches", () => {
    const file = jpeg(exif(true, 118, 3));
    expect(readImageDpi(file).dpi).toBe(299.7);
    const out = setImageDpi(file, 300);
    expect(readImageDpi(out)).toEqual({ dpi: 300, source: "exif" });
  });

  it("adds a pHYs chunk to a PNG that has none, with a valid CRC", () => {
    const file = png();
    expect(readImageDpi(file)).toEqual({ dpi: null, source: null });
    const out = setImageDpi(file, 300);
    expect(out.length).toBe(file.length + 21);
    expect(readImageDpi(out)).toEqual({ dpi: 300, source: "png" });
    const at = 8 + 25; // right after IHDR
    const view = new DataView(out.buffer);
    expect(String.fromCharCode(...out.subarray(at + 4, at + 8))).toBe("pHYs");
    expect(view.getUint32(at + 17)).toBe(crc32(out, at + 4, at + 17));
  });

  it("replaces an existing pHYs chunk instead of adding a second one", () => {
    const file = png(72);
    expect(readImageDpi(file).dpi).toBe(72);
    const out = setImageDpi(file, 600);
    expect(out.length).toBe(file.length);
    expect(readImageDpi(out).dpi).toBe(600);
  });

  it("rejects formats that can't store DPI", () => {
    expect(() => setImageDpi(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45]), 300)).toThrow();
  });

  it("works out the printed size", () => {
    const size = printSize(413, 300);
    expect(size.cm).toBeCloseTo(3.497, 2);
    expect(size.inches).toBeCloseTo(1.377, 2);
  });
});

describe("mergeLayout match: first", () => {
  it("scales the signature to the photo's width, smaller or larger", () => {
    const small = mergeLayout([{ width: 600, height: 800 }, { width: 300, height: 100 }], { direction: "vertical", match: "first", columns: 1, spacing: 0 });
    expect(small.width).toBe(600);
    expect(small.rects[1]).toEqual({ x: 0, y: 800, width: 600, height: 200 });
    const large = mergeLayout([{ width: 600, height: 800 }, { width: 1200, height: 300 }], { direction: "vertical", match: "first", columns: 1, spacing: 0 });
    expect(large.width).toBe(600);
    expect(large.height).toBe(950);
  });
});

describe("name and date caption", () => {
  it("formats the photo date without time-zone shifts", () => {
    expect(formatPhotoDate("2026-10-05", "dd/mm/yyyy")).toBe("05/10/2026");
    expect(formatPhotoDate("2026-10-05", "dd-mm-yyyy")).toBe("05-10-2026");
    expect(formatPhotoDate("2026-10-05", "dd.mm.yyyy")).toBe("05.10.2026");
    expect(formatPhotoDate("2026-01-31", "dd mon yyyy")).toBe("31 Jan 2026");
    expect(formatPhotoDate("", "dd/mm/yyyy")).toBe("");
  });

  it("leaves most of a Kerala PSC 150 × 200 photo for the face, with legible text", () => {
    const two = stripLayout(200, 2);
    expect(two.font).toBe(14);
    expect(two.strip).toBeLessThan(200 * 0.25);
    expect(stripLayout(200, 1).strip).toBeLessThan(two.strip);
    expect(stripLayout(100, 2).font).toBe(11);
  });
});
