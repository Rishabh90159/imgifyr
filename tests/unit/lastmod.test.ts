import { describe, expect, it } from "vitest";
import { OPEN_APPLICATIONS } from "@/lib/requirements/open-applications";
import { lastModified } from "@/lib/seo/lastmod";

describe("sitemap lastmod for pages with application windows", () => {
  const kea = OPEN_APPLICATIONS.find((a) => a.tool === "kea-photo")!;

  it("keeps the page's own date while its windows are open", () => {
    expect(lastModified("2026-11-18", "kea-photo", kea.closes)).toBe("2026-11-18");
  });

  it("moves to the day the window dropped off, once that day has come", () => {
    const next = new Date(`${kea.closes}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const dayAfter = next.toISOString().slice(0, 10);
    expect(lastModified("2026-11-18", "kea-photo", dayAfter)).toBe(dayAfter);
    expect(lastModified("2026-11-18", "kea-photo", "2027-06-01")).toBe(dayAfter);
  });

  it("counts every window for list pages, and never goes past today", () => {
    const latest = lastModified("2026-10-31", undefined, "2027-06-01");
    const closes = OPEN_APPLICATIONS.map((a) => a.closes).sort().at(-1)!;
    expect(latest > closes).toBe(true);
    // Before any window has closed, only the page's own date counts.
    expect(lastModified("2026-10-31", undefined, "2026-11-01")).toBe("2026-10-31");
  });

  it("ignores other exams' windows on an exam page", () => {
    expect(lastModified("2026-11-01", "pan-card-photo", "2027-06-01")).toBe("2026-11-01");
  });
});
