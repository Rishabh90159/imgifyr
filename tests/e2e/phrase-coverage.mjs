// Keeps the wording people actually search on the pages that target it. The phrases below come from Search
// Console (28 days to 15 Nov 2026) and Google India autocomplete; when copy is shortened or reworded, these must
// survive somewhere in the visible text (title, description, headings, FAQ or body). A site-wide floor also stops the
// keyword map and the pages drifting apart again (it was 36% before the 17 Nov coverage pass).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/phrase-coverage.mjs
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const SITE_FLOOR = 0.4;

const SEARCHED = {
  "/tools/resize-image-to-kb": ["photo size reducer in kb", "image size reducer in kb", "reduce photo size in kb", "photo size reducer", "image size reducer"],
  "/tools/50kb-photo": ["resize image to 50kb", "reduce photo size to 50kb", "photo size reducer 50kb", "photo resize 50 kb", "photo resizer 50kb"],
  "/tools/100kb-photo": ["resize image to 100kb", "reduce photo size to 100kb", "reduce image size to 100kb", "100 kb photo size"],
  "/tools/200kb-photo": ["resize image to 200kb", "reduce photo size to 200kb", "reduce image size to 200kb", "compress image to 200kb", "200 kb photo size"],
  "/tools/20kb-photo": ["resize image to 20kb", "reduce photo size to 20kb", "20kb photo size reducer"],
  "/tools/compress-pdf": ["pdf size reducer", "compress pdf to 200kb", "compress pdf to 100kb"],
  "/tools/photo-to-pdf": ["photo to pdf", "image to pdf", "jpg to pdf", "convert photo to pdf", "convert picture to pdf", "photo to pdf 200kb"],
  "/tools/ssc-photo": ["ssc signature size", "ssc photo size", "ssc signature resize", "ssc gd signature size"],
  "/tools/upsc-photo": ["upsc photo size", "upsc photo resize", "upsc photo resizer", "upsc photo and signature size"],
  "/tools/rrb-photo": ["rrb ntpc photo size", "rrb ntpc signature size", "rrb photo resizer", "rrb ntpc photo and signature size"],
  "/tools/sbi-photo": ["sbi po photo size", "sbi image resizer"],
  "/tools/signature-resizer": ["signature resize", "signature resizer in kb", "signature resize for ssc"],
  "/tools/passport-photo": ["passport size photo size in cm", "passport size photo size in pixels", "passport size photo dimensions"],
  "/tools/change-image-dpi": ["change dpi of image", "dpi converter", "image dpi converter", "change dpi to 300"],
  "/tools/image-size-increase": ["increase image size", "increase photo size in kb", "photo size increase"],
  "/tools/whatsapp-dp-without-crop": ["whatsapp dp without crop", "full dp for whatsapp", "whatsapp dp maker", "whatsapp dp size converter"],
};

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
/** Visible words only (scripts other than JSON-LD removed), lower case, punctuation as spaces: "100 KB" ≠ "100kb". */
const words = (html) =>
  ` ${html
    .toLowerCase()
    .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/[^a-z0-9]+/g, " ")} `;
const phrase = (p) => ` ${p.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const page = async (path) => words(await (await fetch(BASE + path)).text());

for (const [path, phrases] of Object.entries(SEARCHED)) {
  const text = await page(path);
  const missing = phrases.filter((p) => !text.includes(phrase(p)));
  check(`${path}: searched phrases on the page`, missing.length === 0, missing.length ? `missing: ${missing.join(" | ")}` : `${phrases.length}/${phrases.length}`);
}

// Site-wide: the share of keyword-map secondary phrases that appear on their pages.
const src = fs.readFileSync("lib/seo/keyword-map.ts", "utf8");
const entries = [...src.matchAll(/path: "([^"]+)",\s*primary: "[^"]+",[\s\S]*?secondary: \[([\s\S]*?)\]/g)].map((m) => ({
  path: m[1],
  secondary: [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
}));
let total = 0;
let present = 0;
for (const e of entries) {
  const text = await page(e.path);
  total += e.secondary.length;
  present += e.secondary.filter((p) => text.includes(phrase(p))).length;
}
check(`keyword map: at least ${SITE_FLOOR * 100}% of target phrases appear on their pages`, present / total >= SITE_FLOOR, `${present}/${total} (${Math.round((present / total) * 100)}%)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
