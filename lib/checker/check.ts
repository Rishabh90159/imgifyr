import type { DetectedFormat } from "@/lib/image-processing/sniff";
import type { ImageSpec } from "@/lib/requirements/types";
import type { PhotoMetrics, SignatureMetrics } from "./metrics";

/**
 * Turns facts about a file (and simple pixel measurements) into a checklist against one form's requirement.
 * "fail" is reserved for things that are measurably wrong (type, pixels, KB); what a computer can only estimate
 * (light, background, blur) is at most a "warn".
 */

export type Verdict = "pass" | "warn" | "fail";
/** Where "Fix it" sends the person: the chosen exam's own page, or a general tool. */
export type FixTarget = "exam" | "image-to-jpg" | "heic-to-jpg" | "resize-image-to-kb" | "white-background-photo" | "image-quality-enhancer" | "signature-resizer";

export interface Finding {
  id: string;
  label: string;
  verdict: Verdict;
  detail: string;
  fix?: FixTarget;
}

export interface FileFacts {
  name: string;
  bytes: number;
  detected: DetectedFormat | null;
  /** Pixel size stored in the file (what a portal reads). */
  width: number;
  height: number;
  /** EXIF orientation, 1 when absent. */
  orientation: number;
  dpi: number | null;
}

const FORMAT_NAME: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/heic": "HEIC (iPhone)",
  "image/avif": "AVIF",
  "image/svg+xml": "SVG",
};

const EXTENSION: Record<string, DetectedFormat> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jfif: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heic",
  avif: "image/avif",
};

const kb = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.round((bytes / 1024) * 10) / 10} KB` : `${Math.round((bytes / 1024 / 1024) * 100) / 100} MB`);
const range = (spec: ImageSpec) =>
  spec.minKB && spec.maxKB ? `${spec.minKB}–${spec.maxKB} KB` : spec.maxKB ? `up to ${spec.maxKB} KB` : `at least ${spec.minKB} KB`;

export function checkFile(f: FileFacts, spec?: ImageSpec): Finding[] {
  const out: Finding[] = [];
  const toJpg: FixTarget = f.detected === "image/heic" ? "heic-to-jpg" : "image-to-jpg";

  // 1. Is the file what its name says? Portals look at the bytes, not the extension.
  if (!f.detected) {
    out.push({ id: "type", label: "File type", verdict: "fail", detail: "This doesn't look like an image file a portal can read." });
    return out;
  }
  const ext = f.name.toLowerCase().split(".").pop() ?? "";
  const claimed = EXTENSION[ext];
  if (claimed && claimed !== f.detected) {
    out.push({
      id: "type",
      label: "File type",
      verdict: "fail",
      detail: `The file is really a ${FORMAT_NAME[f.detected]} saved with a .${ext} name. Portals read the file itself, so renaming doesn't work: convert it.`,
      fix: toJpg,
    });
  } else if (f.detected !== "image/jpeg") {
    const accepted = spec?.format;
    out.push({
      id: "type",
      label: "File type",
      verdict: accepted && !/jp(e)?g/i.test(accepted) ? "pass" : accepted ? "fail" : "warn",
      detail: accepted
        ? /jp(e)?g/i.test(accepted)
          ? `${FORMAT_NAME[f.detected]}; this form accepts ${accepted}.`
          : `${FORMAT_NAME[f.detected]} (accepted: ${accepted}).`
        : `${FORMAT_NAME[f.detected]}. Most exam portals accept only JPG.`,
      fix: toJpg,
    });
  } else {
    out.push({ id: "type", label: "File type", verdict: "pass", detail: spec?.format ? `JPG (accepted: ${spec.format}).` : "JPG, which every exam portal accepts." });
  }

  // 2. Phone photos often carry a rotation tag instead of being stored upright.
  if (f.detected === "image/jpeg" && f.orientation > 1) {
    out.push({
      id: "rotation",
      label: "Rotation",
      verdict: "warn",
      detail: "Your phone saved this picture with a rotation tag rather than upright. Some portals ignore the tag and show it turned. Re-saving it with the exam's tool stores it upright.",
      fix: "exam",
    });
  }

  // 3. Pixel size or shape.
  const dims = `${f.width} × ${f.height} px`;
  if (spec?.widthPx && spec.heightPx) {
    const want = `${spec.widthPx} × ${spec.heightPx}`;
    const exact = f.width === spec.widthPx && f.height === spec.heightPx;
    if (spec.pixelBasis === "minimum") {
      const ok = f.width >= spec.widthPx && f.height >= spec.heightPx;
      out.push({ id: "pixels", label: "Pixel size", verdict: ok ? "pass" : "fail", detail: `${dims}; the form needs at least ${want}.`, fix: ok ? undefined : "exam" });
    } else if (spec.pixelBasis === "preferred") {
      out.push({ id: "pixels", label: "Pixel size", verdict: exact ? "pass" : "warn", detail: `${dims}; the form prefers ${want}.`, fix: exact ? undefined : "exam" });
    } else {
      const turned = f.width === spec.heightPx && f.height === spec.widthPx;
      out.push({
        id: "pixels",
        label: "Pixel size",
        verdict: exact ? "pass" : "fail",
        detail: exact ? `${dims}, as required.` : `${dims}; the form needs ${want}${turned ? " (yours is turned sideways)" : ""}.`,
        fix: exact ? undefined : "exam",
      });
    }
  } else if (spec?.aspect) {
    const ratio = f.width / f.height;
    const ok = Math.abs(ratio - spec.aspect) / spec.aspect <= 0.03;
    const turned = !ok && Math.abs(1 / ratio - spec.aspect) / spec.aspect <= 0.03;
    out.push({
      id: "pixels",
      label: "Shape",
      verdict: ok ? "pass" : "fail",
      detail: ok
        ? `${dims}, the right shape${spec.physical ? ` for ${spec.physical}` : ""}.`
        : `${dims} is the wrong shape${spec.physical ? ` for ${spec.physical}` : ""}${turned ? ": it looks turned sideways" : ""}.`,
      fix: ok ? undefined : "exam",
    });
  } else {
    out.push({ id: "pixels", label: "Pixel size", verdict: "pass", detail: spec ? `${dims}; this form sets no pixel size.` : dims });
  }

  // 4. File size.
  if (spec?.minKB || spec?.maxKB) {
    const over = spec.maxKB !== undefined && f.bytes > spec.maxKB * 1024;
    const under = spec.minKB !== undefined && f.bytes < spec.minKB * 1024;
    out.push({
      id: "kb",
      label: "File size",
      verdict: over || under ? "fail" : "pass",
      detail: `${kb(f.bytes)}; the form needs ${range(spec)}.${over ? " Too large." : under ? " Too small." : ""}`,
      fix: over || under ? "exam" : undefined,
    });
  } else {
    out.push({ id: "kb", label: "File size", verdict: "pass", detail: spec ? `${kb(f.bytes)}; this form sets no file-size limit.` : kb(f.bytes) });
  }

  // 5. DPI, only where the form states one.
  if (spec?.dpi) {
    const ok = f.dpi !== null && Math.round(f.dpi) === spec.dpi;
    out.push({
      id: "dpi",
      label: "DPI",
      verdict: ok ? "pass" : "warn",
      detail: ok ? `${spec.dpi} DPI, as stated.` : `The file records ${f.dpi ? `${Math.round(f.dpi)} DPI` : "no DPI"}; the form mentions ${spec.dpi} DPI.`,
      fix: ok ? undefined : "exam",
    });
  }
  return out;
}

/** Hints from the photo's pixels. `wantsLight`: the form asks for a white or light background. */
export function checkPhoto(m: PhotoMetrics, wantsLight: boolean): Finding[] {
  const out: Finding[] = [];
  if (m.face < 70) out.push({ id: "light", label: "Light", verdict: "warn", detail: "The face area looks too dark. Retake in daylight, facing a window.", fix: "image-quality-enhancer" });
  else if (m.face < 95) out.push({ id: "light", label: "Light", verdict: "warn", detail: "The face area looks a little dark.", fix: "image-quality-enhancer" });
  else if (m.face > 235) out.push({ id: "light", label: "Light", verdict: "warn", detail: "The photo looks washed out (too bright)." });
  else out.push({ id: "light", label: "Light", verdict: "pass", detail: "The face area is well lit." });

  if (m.sideImbalance > 0.35) out.push({ id: "shadow", label: "Even light", verdict: "warn", detail: "One side of the face looks much darker. Face the light source directly." });

  if (m.background.std > 45) {
    out.push({ id: "background", label: "Background", verdict: "warn", detail: "The background doesn't look plain (objects, patterns or shadows).", fix: "white-background-photo" });
  } else if (m.background.mean < (wantsLight ? 150 : 110)) {
    out.push({
      id: "background",
      label: "Background",
      verdict: "warn",
      detail: wantsLight ? "The background looks dark; this form asks for a white or light one." : "The background looks dark; most forms ask for a plain, light one.",
      fix: "white-background-photo",
    });
  } else out.push({ id: "background", label: "Background", verdict: "pass", detail: "Plain, light background." });

  if (m.sharpness < 12) out.push({ id: "sharp", label: "Sharpness", verdict: "warn", detail: "The face may be blurry. Hold the camera steady and wipe the lens." });
  else out.push({ id: "sharp", label: "Sharpness", verdict: "pass", detail: "Looks sharp." });
  return out;
}

/** Hints from the signature's pixels. `miniatureRule`: the form itself warns that miniature signatures are rejected. */
export function checkSignature(m: SignatureMetrics, miniatureRule: boolean): Finding[] {
  const out: Finding[] = [];
  if (!m.inkBox || m.inkShare < 0.002) {
    out.push({ id: "ink", label: "Signature", verdict: "fail", detail: "No dark ink was found. Sign with a black or blue pen on white paper." });
    return out;
  }
  if (m.inkShare > 0.35) {
    out.push({ id: "ink", label: "Signature", verdict: "warn", detail: "A large dark area: is the background dark or shadowed? Use white paper in good light.", fix: "signature-resizer" });
  } else if (m.inkBox.width < 0.5 && m.inkBox.height < 0.5) {
    out.push({
      id: "ink",
      label: "Size in the image",
      verdict: "warn",
      detail: `The signature fills only a small part of the image; crop closer so it fills most of it.${miniatureRule ? " This form says miniature signatures are rejected." : ""}`,
      fix: "exam",
    });
  } else out.push({ id: "ink", label: "Size in the image", verdict: "pass", detail: "The signature fills the image well." });

  if (m.inkLevel > 90) out.push({ id: "faint", label: "Ink", verdict: "warn", detail: "The ink looks faint. Sign with a darker pen and press firmly." });
  if (m.paper < 200) out.push({ id: "paper", label: "Paper", verdict: "warn", detail: "The paper looks grey or shadowed.", fix: "signature-resizer" });
  else out.push({ id: "paper", label: "Paper", verdict: "pass", detail: "Clean, white paper." });
  return out;
}
