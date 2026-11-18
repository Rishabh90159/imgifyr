import { describe, expect, it } from "vitest";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { deriveCrop, KIT_EXAMS, KIT_GROUPS, specAspect, toKitSet } from "@/lib/requirements/kit";
import { getTool } from "@/lib/tools/registry";

const bounds = { width: 3000, height: 4000 };

describe("deriveCrop", () => {
  it("keeps the framed crop when the form states no shape", () => {
    const framed = { x: 100, y: 200, width: 700, height: 900 };
    expect(deriveCrop(framed, null, bounds)).toEqual(framed);
  });

  it("contains the framed area, centred on it, in the form's shape", () => {
    const framed = { x: 1000, y: 1000, width: 700, height: 900 };
    const square = deriveCrop(framed, 1, bounds);
    expect(square.width).toBe(square.height);
    expect(square.width).toBe(900);
    expect(square.x).toBeLessThanOrEqual(framed.x);
    expect(square.x + square.width).toBeGreaterThanOrEqual(framed.x + framed.width);
    expect(square.x + square.width / 2).toBeCloseTo(framed.x + framed.width / 2, 0);

    const tall = deriveCrop(framed, 2.5 / 3.5, bounds);
    expect(tall.width).toBe(700);
    expect(tall.height).toBe(980);
    expect(tall.y).toBe(960);
  });

  it("shrinks to fit inside a small picture, keeping the shape", () => {
    const framed = { x: 0, y: 0, width: 600, height: 800 };
    const out = deriveCrop(framed, 1, { width: 600, height: 800 });
    expect(out).toEqual({ x: 0, y: 100, width: 600, height: 600 });
  });

  it("never goes outside the picture", () => {
    const framed = { x: 2800, y: 3800, width: 200, height: 200 };
    const out = deriveCrop(framed, 4.5 / 2, bounds);
    expect(out.x + out.width).toBeLessThanOrEqual(bounds.width);
    expect(out.y + out.height).toBeLessThanOrEqual(bounds.height);
  });
});

describe("kit data", () => {
  it("offers every exam once, in a known group, with an existing page and at least one photo or signature", () => {
    const ids = KIT_EXAMS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("upsc");
    for (const e of KIT_EXAMS) {
      expect(KIT_GROUPS).toContain(e.group);
      expect(getTool(e.tool).path).toMatch(/^\/tools\//);
      const sets = APPLICATIONS[e.id].sets.filter((s) => s.photo || s.signature).map(toKitSet);
      expect(sets.length, e.id).toBeGreaterThan(0);
    }
  });

  it("flags live photos and extra uploads instead of dropping them silently", () => {
    const afcat = toKitSet(APPLICATIONS.afcat.sets[0]);
    expect(afcat.extras).toContain("thumb impression");
    const gd = APPLICATIONS.ssc.sets.find((s) => s.id === "ssc-gd-2026")!;
    expect(toKitSet(gd).livePhoto).toBe(true);
  });

  it("reads the shape from the stated aspect or pixel size", () => {
    expect(specAspect({ kind: "photo", widthPx: 200, heightPx: 100, rules: ["x"] })).toBe(2);
    expect(specAspect({ kind: "photo", aspect: 0.5, rules: ["x"] })).toBe(0.5);
    expect(specAspect({ kind: "photo", rules: ["x"] })).toBeNull();
  });
});
