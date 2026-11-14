import type { ToolId } from "@/lib/tools/registry";

/**
 * Application windows that are open now, each from the same official notice as its tool page.
 * An entry disappears by itself the day after `closes`: pages that list these are regenerated daily.
 */
export interface OpenApplication {
  tool: ToolId;
  /** What the candidate is applying for, as the notice names it. */
  exam: string;
  /** Last day to apply online (ISO date, India time). */
  closes: string;
}

export const OPEN_APPLICATIONS: OpenApplication[] = [
  { tool: "upessc-photo", exam: "UP TGT 2026 (UPESSC Advt 07/2026)", closes: "2026-11-23" },
  { tool: "upessc-photo", exam: "UPESSC Principal and Headmaster (08 and 09/2026)", closes: "2026-11-22" },
  { tool: "jee-main-photo", exam: "JEE Main 2027, Session 1", closes: "2026-11-22" },
  { tool: "rrb-photo", exam: "RRB Station Master (CEN 08/2026)", closes: "2026-11-25" },
  { tool: "kea-photo", exam: "KEA FDA and SDA 2026 (Karnataka)", closes: "2026-11-25" },
  { tool: "indian-bank-photo", exam: "Indian Bank Apprentice 2026-27", closes: "2026-11-25" },
  { tool: "rrc-apprentice-photo", exam: "Central Railway Act Apprentice (RRC/CR/AA/2026)", closes: "2026-12-02" },
  { tool: "afcat-photo", exam: "AFCAT 01/2027 (Indian Air Force)", closes: "2026-12-11" },
  { tool: "dsssb-photo", exam: "DSSSB JE (Electrical) and MTS (Advt 06/2026)", closes: "2026-12-11" },
];

/** Today's date in India, where every listed application runs. */
export function todayInIndia(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Windows still open on `today`, closing soonest first. */
export function openApplications(today = todayInIndia()): OpenApplication[] {
  return OPEN_APPLICATIONS.filter((a) => a.closes >= today).sort((a, b) => a.closes.localeCompare(b.closes));
}
