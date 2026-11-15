// End-to-end tests for the India Post GDS photo and signature page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/india-post-gds.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/india-post-gds";
const KB = 1024;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
await generateFixtures(browser, FIX);
const origin = new URL(BASE).origin;
const offending = [];
const consoleErrors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});

function jpegSize(bytes) {
  let i = 2;
  while (i < bytes.length) {
    const marker = bytes[i + 1];
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (marker >= 0xc0 && marker <= 0xc3) return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
    i += 2 + length;
  }
  return null;
}
// JFIF header: density units at byte 13 (1 = dots per inch), X density at bytes 14–15.
const jpegDpi = (b) => (b[13] === 1 ? (b[14] << 8) | b[15] : 0);

async function open(route) {
  const page = await context.newPage();
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${route}: ${m.text()}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return page;
}

/** Picks the kind, adds a file, creates it (enlarging when it's under the minimum, as a user would) and downloads it. */
async function make(page, file, button, kindLabel) {
  if (kindLabel) await page.locator("#prepare").getByText(kindLabel, { exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const grow = result.getByRole("button", { name: /^Make it larger/ });
  const grown = (await grow.count()) > 0;
  if (grown) {
    await grow.first().click();
    await page.waitForFunction(() => /enlarged from/.test(document.querySelector('section[aria-labelledby="result-heading"]')?.textContent ?? ""), null, { timeout: 60_000 });
  }
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  return { bytes, grown, size: jpegSize(bytes), dpi: jpegDpi(bytes) };
}
const kb = (b) => `${(b.length / KB).toFixed(1)} KB`;
const inRange = (b, min, max) => b.length >= min * KB && b.length <= max * KB;
const ratioOk = (s, r) => s && Math.abs(s.width / s.height - r) / r < 0.01;

{
  const page = await open("/tools/india-post-gds-photo");
  const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
  check("GDS: India Post instructions linked", (await page.locator('a[href^="https://indiapost.gov.in/"]').count()) >= 1);
  check("GDS: sizes shown (30–100 KB, 20–100 KB, 320 × 400, 300 × 120)", /30 KB – 100 KB/.test(summary) && /20 KB – 100 KB/.test(summary) && /320 × 400/.test(summary) && /300 × 120/.test(summary));
  check("GDS: face 70–80% and no-selfie rules shown", summary.includes("70–80%") && summary.includes("selfie"));
  const withoutCheckDate = summary.replace(/checked \d{1,2} \w+ \d{4}/, "");
  check("GDS: no year or 'previous notice' wording", !/2025|2026|previous|last year|isn't out yet/i.test(withoutCheckDate));
  const photo = await make(page, "portrait.jpg", "Create photo file");
  check(
    "GDS photo: 4:5, 30–100 KB, 150 DPI",
    ratioOk(photo.size, 4 / 5) && inRange(photo.bytes, 30, 100) && photo.dpi === 150,
    `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}, ${photo.dpi} DPI${photo.grown ? ", enlarged" : ""}`,
  );
  await page.close();
}
{
  const page = await open("/tools/india-post-gds-photo");
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  check(
    "GDS signature: 5:2, 20–100 KB, 150 DPI",
    ratioOk(sig.size, 5 / 2) && inRange(sig.bytes, 20, 100) && sig.dpi === 150,
    `${sig.size?.width}×${sig.size?.height}, ${kb(sig.bytes)}, ${sig.dpi} DPI${sig.grown ? ", enlarged" : ""}`,
  );
  await page.close();
}
{
  const page = await open("/tools/application-photos");
  const hrefs = await page.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check("Hub: India Post GDS listed", hrefs.includes("/tools/india-post-gds-photo"));
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
