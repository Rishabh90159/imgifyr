/**
 * Geometry and text for the name-and-date caption printed under a photo.
 * Pure functions, so the layout is tested without a browser.
 */
export type DateFormat = "dd/mm/yyyy" | "dd-mm-yyyy" | "dd.mm.yyyy" | "dd mon yyyy";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD, as given by a date input) without time-zone shifts. */
export function formatPhotoDate(iso: string, format: DateFormat): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [, y, m, d] = match;
  if (format === "dd mon yyyy") return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
  const sep = format === "dd/mm/yyyy" ? "/" : format === "dd-mm-yyyy" ? "-" : ".";
  return [d, m, y].join(sep);
}

/** Caption strip for an output height: text scales with the photo, never below a readable 11 px. */
export function stripLayout(height: number, lines: number): { font: number; lineHeight: number; strip: number } {
  const font = Math.max(11, Math.round(height * 0.07));
  const lineHeight = Math.round(font * 1.25);
  return { font, lineHeight, strip: lines * lineHeight + Math.round(font * 0.5) };
}
