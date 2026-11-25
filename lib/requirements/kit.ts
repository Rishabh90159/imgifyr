import type { PixelRect } from "@/lib/image-processing/types";
import type { ToolId } from "@/lib/tools/registry";
import type { ApplicationId } from "./applications";
import type { ImageSpec, RequirementSet } from "./types";

/**
 * The "one photo, every exam" kit: which applications it offers and how one framing of the photo (or signature) is
 * turned into each form's own shape. Every size comes from the same requirement data as the exam pages.
 */

export const KIT_GROUPS = ["Banking, SSC and railways", "Entrance exams", "Teaching, police and state jobs", "ID documents"] as const;
export type KitGroup = (typeof KIT_GROUPS)[number];

/** UPSC is left out: its sizes are only published inside its portal, so there is nothing verified to apply. */
export const KIT_EXAMS: { id: ApplicationId; tool: ToolId; group: KitGroup }[] = [
  { id: "ssc", tool: "ssc-photo", group: "Banking, SSC and railways" },
  { id: "rrb", tool: "rrb-photo", group: "Banking, SSC and railways" },
  { id: "ibps", tool: "ibps-photo", group: "Banking, SSC and railways" },
  { id: "sbi", tool: "sbi-photo", group: "Banking, SSC and railways" },
  { id: "indianBank", tool: "indian-bank-photo", group: "Banking, SSC and railways" },
  { id: "rrc", tool: "rrc-apprentice-photo", group: "Banking, SSC and railways" },
  { id: "neet", tool: "neet-photo", group: "Entrance exams" },
  { id: "jee", tool: "jee-main-photo", group: "Entrance exams" },
  { id: "cuet", tool: "cuet-photo", group: "Entrance exams" },
  { id: "mhtCet", tool: "mht-cet-photo", group: "Entrance exams" },
  { id: "kcet", tool: "kcet-photo", group: "Entrance exams" },
  { id: "ctet", tool: "ctet-photo", group: "Teaching, police and state jobs" },
  { id: "upessc", tool: "upessc-photo", group: "Teaching, police and state jobs" },
  { id: "upsssc", tool: "upsssc-photo", group: "Teaching, police and state jobs" },
  { id: "upPolice", tool: "up-police-photo", group: "Teaching, police and state jobs" },
  { id: "gujaratPolice", tool: "gujarat-police-photo", group: "Teaching, police and state jobs" },
  { id: "dsssb", tool: "dsssb-photo", group: "Teaching, police and state jobs" },
  { id: "kea", tool: "kea-photo", group: "Teaching, police and state jobs" },
  { id: "gds", tool: "india-post-gds-photo", group: "Teaching, police and state jobs" },
  { id: "afcat", tool: "afcat-photo", group: "Teaching, police and state jobs" },
  { id: "pan", tool: "pan-card-photo", group: "ID documents" },
  { id: "eci", tool: "voter-id-photo", group: "ID documents" },
  { id: "sarathi", tool: "driving-licence-photo", group: "ID documents" },
];

/** One notice, reduced to what the kit makes: the photo and signature specs, plus notes on what it can't make. */
export interface KitSet {
  id: string;
  name: string;
  photo?: ImageSpec;
  signature?: ImageSpec;
  /** The form also captures a live photo with the camera. */
  livePhoto: boolean;
  /** Other uploads the form needs (thumb impression, declaration), made on the exam's own page. */
  extras: string[];
}

export interface KitExam {
  id: string;
  name: string;
  /** The exam's own page, for checking the source and fine-tuning. */
  path: string;
  group: KitGroup;
  sets: KitSet[];
}

export function toKitSet(set: RequirementSet): KitSet {
  const extras: string[] = [];
  if (set.thumb) extras.push((set.thumb.label ?? "thumb impression").toLowerCase());
  if (set.declaration) extras.push((set.declaration.label ?? "hand-written declaration").toLowerCase());
  return { id: set.id, name: set.name, photo: set.photo, signature: set.signature, livePhoto: Boolean(set.livePhotoCapture), extras };
}

/** The crop shape a spec asks for (width / height), or null when it states none. */
export function specAspect(spec: ImageSpec): number | null {
  return spec.aspect ?? (spec.widthPx && spec.heightPx ? spec.widthPx / spec.heightPx : null);
}

/**
 * Turns the one crop the person framed into the crop for a form with another shape: the smallest rectangle of
 * `aspect` that contains the framed area, centred on it, so nothing that was framed is lost. When the picture is too
 * small for that, it shrinks (same shape, same centre) to fit inside the picture. No aspect: the framed crop as is.
 */
export function deriveCrop(framed: PixelRect, aspect: number | null, bounds: { width: number; height: number }): PixelRect {
  if (!aspect) return framed;
  let width = framed.width;
  let height = framed.height;
  if (width / height < aspect) width = height * aspect;
  else height = width / aspect;
  const fit = Math.min(1, bounds.width / width, bounds.height / height);
  width *= fit;
  height *= fit;
  const cx = framed.x + framed.width / 2;
  const cy = framed.y + framed.height / 2;
  const x = Math.min(Math.max(cx - width / 2, 0), bounds.width - width);
  const y = Math.min(Math.max(cy - height / 2, 0), bounds.height - height);
  return { x: Math.round(x), y: Math.round(y), width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
}

/**
 * A short label for a notice in a dropdown. Browsers size an open list to its longest option, so full notice names
 * ("AFCAT 01/2027: Flying, Ground Duty (Technical and Non-Technical), NCC Special Entry…") spill over the page.
 * Keeps the part before the first colon, says "Exam" for "Examination", and caps the length; the full name is shown
 * next to the dropdown.
 */
export function shortNoticeName(name: string, max = 50): string {
  const short = name.split(":")[0].replace(/\bExamination\b/g, "Exam").trim();
  return short.length > max ? `${short.slice(0, max - 1).trimEnd()}…` : short;
}
