import { describe, expect, it } from "vitest";
import { POPULAR, searchTools } from "@/lib/search/tool-index";

const first = (query: string) => searchTools(query)[0]?.href;
const top = (query: string, n = 3) => searchTools(query).slice(0, n).map((m) => m.href);

describe("site search", () => {
  it("finds tools by name, format pair and exam", () => {
    expect(first("50kb")).toBe("/tools/50kb-photo");
    expect(first("pdf to jpg")).toBe("/tools/pdf-to-jpg");
    expect(first("png to jpg")).toBe("/tools/png-to-jpg");
    expect(first("ssc")).toBe("/tools/ssc-photo");
    expect(top("passport", 2)).toEqual(expect.arrayContaining(["/tools/passport-photo", "/tools/passport-photo-resizer"]));
    expect(first("remove background")).toBe("/tools/background-remover");
    expect(first("heic")).toBe("/tools/heic-to-jpg");
  });

  it("turns a typed size into that page, or the KB tool preset to it", () => {
    expect(first("50 KB")).toBe("/tools/50kb-photo");
    expect(first("photo 30kb")).toBe("/tools/30kb-photo");
    expect(first("photo 35kb")).toBe("/tools/resize-image-to-kb?target=35");
    expect(searchTools("35 kb")[0]?.name).toBe("Resize image to 35 KB");
  });

  it("understands everyday, Hinglish and Hindi wording", () => {
    expect(first("photo ka size kaise kam kare")).toBe("/tools/resize-image-to-kb");
    expect(first("photo ko kb me kaise kare")).toBe("/tools/resize-image-to-kb");
    expect(top("image size reduce", 2)).toEqual(expect.arrayContaining(["/tools/image-compressor", "/tools/resize-image-to-kb"]));
    expect(first("pdf ka size kam kare")).toBe("/tools/compress-pdf");
    expect(top("signature ka size kam")).toContain("/tools/signature-resizer");
    expect(first("railway photo")).toBe("/tools/rrb-photo");
    expect(first("फोटो का साइज कम")).toBe("/tools/resize-image-to-kb");
    expect(first("पासपोर्ट फोटो")).toMatch(/passport-photo/);
    expect(top("iphone photo")).toContain("/tools/heic-to-jpg");
  });

  it("finds descriptions, not only names", () => {
    expect(top("white background")).toContain("/tools/white-background-photo");
    expect(top("transparent signature")).toContain("/tools/transparent-signature");
    expect(first("round profile picture")).toBe("/tools/circle-crop");
    expect(first("dp")).toBe("/tools/circle-crop");
  });

  it("returns nothing for empty or meaningless queries, and offers popular tools", () => {
    expect(searchTools("")).toEqual([]);
    expect(searchTools("how to")).toEqual([]);
    expect(searchTools("qwertyzzz")).toEqual([]);
    expect(POPULAR.length).toBe(5);
  });
});
