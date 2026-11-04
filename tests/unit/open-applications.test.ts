import { describe, expect, it } from "vitest";
import { OPEN_APPLICATIONS, openApplications, todayInIndia } from "@/lib/requirements/open-applications";

describe("open applications", () => {
  it("keeps a window open through its last day and drops it the day after", () => {
    const { closes } = OPEN_APPLICATIONS[0];
    expect(openApplications(closes).some((a) => a.closes === closes)).toBe(true);
    expect(openApplications("2099-01-01")).toEqual([]);
  });

  it("lists the soonest closing first", () => {
    const dates = openApplications("2000-01-01").map((a) => a.closes);
    expect(dates).toEqual([...dates].sort());
  });

  it("uses the date in India, not UTC", () => {
    // 20:00 UTC on 22 Nov is already 23 Nov in India.
    expect(todayInIndia(new Date("2026-11-22T20:00:00Z"))).toBe("2026-11-23");
  });
});
