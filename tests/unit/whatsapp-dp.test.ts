import { describe, expect, it } from "vitest";
import { circlePlacement } from "@/lib/image-processing/fit";

/** True when every corner of the placed photo lies inside the circle WhatsApp shows. */
function cornersInside(rect: { x: number; y: number; width: number; height: number }, side: number) {
  const r = side / 2;
  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ];
  return corners.every(([x, y]) => Math.hypot(x - r, y - r) <= r);
}

describe("circlePlacement", () => {
  it.each([
    [4000, 3000],
    [3000, 4000],
    [1080, 1080],
    [1920, 1080],
    [600, 2400],
  ])("keeps a %i × %i photo entirely inside the round view, centred, without stretching", (w, h) => {
    const rect = circlePlacement(w, h, 1080);
    expect(cornersInside(rect, 1080)).toBe(true);
    expect(Math.abs(rect.x + rect.width / 2 - 540)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.y + rect.height / 2 - 540)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.width / rect.height - w / h)).toBeLessThan(0.01 * (w / h));
  });

  it("uses most of the circle rather than shrinking the photo needlessly", () => {
    const rect = circlePlacement(1080, 1080, 1080);
    // A square inscribed in the circle has side r·√2 ≈ 764 px; with the 2% margin about 748.
    expect(rect.width).toBeGreaterThan(740);
  });
});
