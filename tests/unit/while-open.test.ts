import { afterEach, describe, expect, it, vi } from "vitest";
import { WhileOpen } from "@/components/requirements/while-open";

describe("WhileOpen", () => {
  afterEach(() => vi.useRealTimers());

  it("shows the passage up to and including the closing day (India time), then drops it", () => {
    vi.useFakeTimers();
    // 25 Nov 2026, 23:00 in India
    vi.setSystemTime(new Date("2026-11-25T17:30:00Z"));
    expect(WhileOpen({ closes: "2026-11-25", children: "dates" })).not.toBeNull();
    // 26 Nov 2026, 00:30 in India (still 25 Nov in UTC)
    vi.setSystemTime(new Date("2026-11-25T19:00:00Z"));
    expect(WhileOpen({ closes: "2026-11-25", children: "dates" })).toBeNull();
  });
});
