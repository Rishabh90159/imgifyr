import { crc32 } from "@/lib/utils/crc32";

/**
 * Reads and changes the print resolution (DPI) stored in JPG and PNG files
 * without touching the image data, so the picture stays byte-for-byte
 * identical and only its printed size changes.
 *
 * A JPG can hold the value twice: in the JFIF header and in EXIF (phone
 * photos usually have only EXIF, at 72). Windows and Photoshop read EXIF
 * first, so both are updated; otherwise the file would still show the old DPI.
 * PNG stores it in a pHYs chunk, in pixels per metre.
 */
export type DpiSource = "exif" | "jfif" | "png";

export interface DpiInfo {
  /** Horizontal resolution in pixels per inch, or null when the file doesn't record one. */
  dpi: number | null;
  /** Where the value was found. */
  source: DpiSource | null;
}

const INCH_M = 0.0254;
const MAX_DPI = 65535;

function u16be(b: Uint8Array, i: number): number {
  return (b[i] << 8) | b[i + 1];
}

/** Rounds to at most one decimal (cm-based files can give 299.99…). */
function tidy(dpi: number): number {
  return Math.round(dpi * 10) / 10;
}

export function isPngBytes(b: Uint8Array): boolean {
  return b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
}

function isJpegBytes(b: Uint8Array): boolean {
  return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}

interface Segment {
  marker: number;
  /** Offset of the 0xFF marker byte. */
  start: number;
  /** Offset of the payload (after the length field). */
  body: number;
  /** Offset just past the segment. */
  end: number;
}

/** The JPEG header segments before the first scan. */
function jpegSegments(b: Uint8Array): Segment[] {
  const out: Segment[] = [];
  let i = 2;
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break;
    const length = u16be(b, i + 2);
    if (length < 2 || i + 2 + length > b.length) break;
    out.push({ marker, start: i, body: i + 4, end: i + 2 + length });
    i += 2 + length;
  }
  return out;
}

function isJfif(b: Uint8Array, s: Segment): boolean {
  return s.marker === 0xe0 && s.end - s.body >= 12 && b[s.body] === 0x4a && b[s.body + 1] === 0x46 && b[s.body + 2] === 0x49 && b[s.body + 3] === 0x46 && b[s.body + 4] === 0;
}

function isExif(b: Uint8Array, s: Segment): boolean {
  return s.marker === 0xe1 && s.end - s.body >= 14 && String.fromCharCode(b[s.body], b[s.body + 1], b[s.body + 2], b[s.body + 3]) === "Exif";
}

/** Resolution tags in EXIF IFD0: where their values live, so they can be read and patched in place. */
interface ExifResolution {
  little: boolean;
  /** Offsets of the 8-byte RATIONAL values. */
  x: number | null;
  y: number | null;
  /** Offset of the ResolutionUnit SHORT value (inside its directory entry). */
  unit: number | null;
}

function exifResolution(b: Uint8Array, s: Segment): ExifResolution | null {
  const tiff = s.body + 6;
  const end = s.end;
  if (tiff + 8 > end) return null;
  const little = b[tiff] === 0x49 && b[tiff + 1] === 0x49;
  if (!little && !(b[tiff] === 0x4d && b[tiff + 1] === 0x4d)) return null;
  const r16 = (o: number) => (little ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const r32 = (o: number) => (little ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 0x1000000 : b[o] * 0x1000000 + ((b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]));
  const ifd = tiff + r32(tiff + 4);
  if (ifd + 2 > end) return null;
  const found: ExifResolution = { little, x: null, y: null, unit: null };
  const count = r16(ifd);
  for (let k = 0; k < count; k++) {
    const entry = ifd + 2 + k * 12;
    if (entry + 12 > end) break;
    const tag = r16(entry);
    const type = r16(entry + 2);
    if ((tag === 0x011a || tag === 0x011b) && type === 5) {
      const at = tiff + r32(entry + 8);
      if (at + 8 <= end) found[tag === 0x011a ? "x" : "y"] = at;
    } else if (tag === 0x0128 && type === 3) {
      found.unit = entry + 8;
    }
  }
  return found;
}

function readRational(b: Uint8Array, at: number, little: boolean): number | null {
  const r32 = (o: number) => (little ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 0x1000000 : b[o] * 0x1000000 + ((b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]));
  const num = r32(at);
  const den = r32(at + 4);
  return den > 0 && num > 0 ? num / den : null;
}

function write32(b: Uint8Array, at: number, value: number, little: boolean): void {
  if (little) {
    b[at] = value & 0xff;
    b[at + 1] = (value >>> 8) & 0xff;
    b[at + 2] = (value >>> 16) & 0xff;
    b[at + 3] = (value >>> 24) & 0xff;
  } else {
    b[at] = (value >>> 24) & 0xff;
    b[at + 1] = (value >>> 16) & 0xff;
    b[at + 2] = (value >>> 8) & 0xff;
    b[at + 3] = value & 0xff;
  }
}

/** Reads the stored print resolution of a JPG or PNG. */
export function readImageDpi(b: Uint8Array): DpiInfo {
  if (isPngBytes(b)) {
    const phys = findPngChunk(b, "pHYs");
    if (phys !== null && b[phys + 16] === 1) {
      const ppm = new DataView(b.buffer, b.byteOffset).getUint32(phys + 8);
      if (ppm > 0) return { dpi: tidy(ppm * INCH_M), source: "png" };
    }
    return { dpi: null, source: null };
  }
  if (!isJpegBytes(b)) return { dpi: null, source: null };
  let jfif: number | null = null;
  for (const s of jpegSegments(b)) {
    if (isExif(b, s)) {
      const res = exifResolution(b, s);
      if (res?.x != null) {
        const value = readRational(b, res.x, res.little);
        // ResolutionUnit: 2 = inch (the default when absent), 3 = centimetre.
        const unit = res.unit != null ? (res.little ? b[res.unit] | (b[res.unit + 1] << 8) : u16be(b, res.unit)) : 2;
        if (value && (unit === 2 || unit === 3)) return { dpi: tidy(unit === 3 ? value * 2.54 : value), source: "exif" };
      }
    }
    if (jfif === null && isJfif(b, s)) {
      const units = b[s.body + 7];
      const density = u16be(b, s.body + 8);
      if (density > 0 && units === 1) jfif = density;
      else if (density > 0 && units === 2) jfif = tidy(density * 2.54);
    }
  }
  return jfif !== null ? { dpi: jfif, source: "jfif" } : { dpi: null, source: null };
}

/**
 * Returns a copy of a JPG or PNG with the print resolution set to `dpi`.
 * Only header bytes change. Throws for other formats.
 */
export function setImageDpi(b: Uint8Array, dpi: number): Uint8Array {
  const density = Math.round(Math.min(MAX_DPI, Math.max(1, dpi)));
  if (isPngBytes(b)) return setPngDpi(b, density);
  if (isJpegBytes(b)) return setJpegDpiBoth(b, density);
  throw new Error("Only JPG and PNG files can store a DPI value without being converted.");
}

function setJpegDpiBoth(input: Uint8Array, density: number): Uint8Array {
  const b = input.slice();
  let hasJfif = false;
  for (const s of jpegSegments(b)) {
    if (isJfif(b, s)) {
      hasJfif = true;
      b[s.body + 7] = 1; // units: dots per inch
      b[s.body + 8] = density >> 8;
      b[s.body + 9] = density & 0xff;
      b[s.body + 10] = density >> 8;
      b[s.body + 11] = density & 0xff;
    } else if (isExif(b, s)) {
      const res = exifResolution(b, s);
      if (!res) continue;
      for (const at of [res.x, res.y]) {
        if (at === null) continue;
        write32(b, at, density, res.little);
        write32(b, at + 4, 1, res.little);
      }
      if (res.unit !== null) {
        b[res.unit] = res.little ? 2 : 0;
        b[res.unit + 1] = res.little ? 0 : 2;
      }
    }
  }
  if (hasJfif) return b;
  // No JFIF segment: add one straight after the start-of-image marker.
  const app0 = Uint8Array.of(0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, density >> 8, density & 0xff, density >> 8, density & 0xff, 0x00, 0x00);
  const out = new Uint8Array(b.length + app0.length);
  out.set(b.subarray(0, 2), 0);
  out.set(app0, 2);
  out.set(b.subarray(2), 2 + app0.length);
  return out;
}

/** Offset of a chunk's length field, searching only before the image data. */
function findPngChunk(b: Uint8Array, type: string): number | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let offset = 8;
  while (offset + 12 <= b.length) {
    const length = view.getUint32(offset);
    const name = String.fromCharCode(b[offset + 4], b[offset + 5], b[offset + 6], b[offset + 7]);
    if (name === type) return offset;
    if (name === "IDAT" || name === "IEND") return null;
    offset += 12 + length;
  }
  return null;
}

function setPngDpi(b: Uint8Array, density: number): Uint8Array {
  const ppm = Math.round(density / INCH_M);
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  chunk[16] = 1; // unit: metre
  view.setUint32(17, crc32(chunk, 4, 17));

  const existing = findPngChunk(b, "pHYs");
  const ihdrLength = new DataView(b.buffer, b.byteOffset).getUint32(8);
  const at = existing ?? 8 + 12 + ihdrLength; // replace in place, or insert right after IHDR
  const removed = existing === null ? 0 : 21;
  const out = new Uint8Array(b.length - removed + 21);
  out.set(b.subarray(0, at), 0);
  out.set(chunk, at);
  out.set(b.subarray(at + removed), at + 21);
  return out;
}

/** Printed size for a pixel dimension at a resolution. */
export function printSize(px: number, dpi: number): { cm: number; inches: number } {
  const inches = px / dpi;
  return { cm: inches * 2.54, inches };
}
