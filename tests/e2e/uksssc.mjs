// End-to-end tests for the UKSSSC page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/uksssc.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/uksssc";
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

const page = await context.newPage();
page.on("pageerror", (e) => consoleErrors.push(e.message));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
await page.goto(`${BASE}/tools/uksssc-photo`, { waitUntil: "networkidle" });

const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
check("UKSSSC: official advertisements linked", (await page.locator('a[href^="https://cdnbbsr.s3waas.gov.in/s34ffd0e19d2069412274bd3025b0e176c/"]').count()) >= 1);
check("UKSSSC: live photo and 150 × 100 shown", summary.includes("live photo capture") && /150 × 100/.test(summary));
check("UKSSSC: Aadhaar both sides note shown", summary.includes("both sides of your Aadhaar card"));

async function make(kind, fixture, button) {
  if (kind !== "Photograph") await page.getByRole("radio", { name: kind }).check({ force: true });
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, fixture));
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  return { bytes, size: jpegSize(bytes) };
}

const sign = await make("Signature", "signature.jpg", "Create signature file");
check("signature: 150 × 100 JPG", sign.size?.width === 150 && sign.size?.height === 100, `${sign.size?.width}×${sign.size?.height}, ${(sign.bytes.length / KB).toFixed(1)} KB`);
await page.goto(`${BASE}/tools/uksssc-photo`, { waitUntil: "networkidle" });
const thumb = await make("Thumb impression", "signature.jpg", "Create thumb impression file");
check("thumb impression: 150 × 100 JPG", thumb.size?.width === 150 && thumb.size?.height === 100, `${thumb.size?.width}×${thumb.size?.height}, ${(thumb.bytes.length / KB).toFixed(1)} KB`);
await page.close();

const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
const m = await mobile.newPage();
await m.goto(`${BASE}/tools/uksssc-photo`, { waitUntil: "networkidle" });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check("mobile: no horizontal scroll", overflow <= 0, `${overflow}px`);
await mobile.close();

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
