import type { ResultImage } from "@/components/before-after/result-panel";
import type { ImageMime } from "@/lib/image-processing/formats";
import type { Job, ResultFor, TargetResult } from "@/lib/image-processing/types";

/** Photos processed together when several are chosen at once. */
export const MAX_BATCH = 10;

/** The size settings, shared by single and batch mode so both make identical files. */
export interface TargetSettings {
  targetBytes: number;
  /** Lower limit of a size range, when the form sets one (JPG only). */
  minBytes: number | null;
  format: "image/jpeg" | "image/webp";
  allowResize: boolean;
  maxWidth: number | null;
  maxQuality: number | null;
}

export interface TargetOutput {
  result: TargetResult;
  image: ResultImage;
  /** Bytes of padding added to reach the minimum (0 when none was needed). */
  paddedBytes: number;
}

type RunJob = <J extends Job>(job: J) => Promise<ResultFor<J> | null>;

/** Reduces one image to the target: the shared exact-KB search, then padding up to a minimum if one is set. */
export async function reduceToTarget(
  run: RunJob,
  image: { id: string; file: Blob; mime: ImageMime; width: number; height: number },
  settings: TargetSettings,
): Promise<TargetOutput | null> {
  const capped = settings.maxWidth && settings.maxWidth < image.width ? settings.maxWidth : null;
  const result = await run({
    kind: "target",
    sourceId: image.id,
    file: image.file,
    sourceMime: image.mime,
    targetBytes: settings.targetBytes,
    mime: settings.format,
    allowResize: settings.allowResize,
    background: "#ffffff",
    width: capped ?? undefined,
    height: capped ? Math.max(1, Math.round((capped * image.height) / image.width)) : undefined,
    maxQuality: settings.maxQuality ?? undefined,
  });
  if (!result) return null;
  let mime: ImageMime = result.usedOriginal ? image.mime : settings.format;
  let blob = result.blob;
  let paddedBytes = 0;
  // Under the form's minimum: add bytes that image viewers ignore, so the picture stays exactly the same.
  if (settings.minBytes && blob.size < settings.minBytes) {
    const padded = await run({ kind: "inflate", sourceId: `${image.id}:min:${blob.size}`, file: blob, sourceMime: mime, targetBytes: settings.minBytes, method: "pad" });
    if (!padded) return null;
    paddedBytes = padded.paddedBytes;
    blob = padded.blob;
    mime = "image/jpeg";
  }
  return { result, paddedBytes, image: { blob, width: result.width, height: result.height, mime } };
}

/** The verdict for one result: within the target (or range), already under it, or the closest achievable. */
export function targetVerdict(output: TargetOutput, settings: TargetSettings): "met" | "unchanged" | "closest" {
  const size = output.image.blob.size;
  if (output.result.usedOriginal) return "unchanged";
  return size <= settings.targetBytes && (!settings.minBytes || size >= settings.minBytes) ? "met" : "closest";
}
