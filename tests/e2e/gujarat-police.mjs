// End-to-end tests for the Gujarat Police (GPRB, OJAS) page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/gujarat-police.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/gujarat-police";
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
await page.goto(`${BASE}/tools/gujarat-police-photo`, { waitUntil: "networkidle" });

const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
check("Gujarat Police: official GPRB document linked", (await page.locator('a[href^="https://gprb.gujarat.gov.in/"]').count()) >= 1);
check("Gujarat Police: 15 KB, 5 × 3.6 cm and 2.5 × 7.5 cm shown", /up to 15 KB/.test(summary) && summary.includes("5 cm (height) × 3.6 cm (width)") && summary.includes("2.5 cm (height) × 7.5 cm (width)"));
check("Gujarat Police: OJAS dates and OTR note shown", summary.includes("16 December 2026") && summary.includes("One Time Registration"));

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

const photo = await make("Photograph", "portrait.jpg", "Create photo file");
check("photo: 213 × 295 JPG, at most 15 KB", photo.size?.width === 213 && photo.size?.height === 295 && photo.bytes.length <= 15 * KB, `${photo.size?.width}×${photo.size?.height}, ${(photo.bytes.length / KB).toFixed(1)} KB`);
await page.goto(`${BASE}/tools/gujarat-police-photo`, { waitUntil: "networkidle" });
const sign = await make("Signature", "signature.jpg", "Create signature file");
check("signature: 443 × 148 JPG, at most 15 KB", sign.size?.width === 443 && sign.size?.height === 148 && sign.bytes.length <= 15 * KB, `${sign.size?.width}×${sign.size?.height}, ${(sign.bytes.length / KB).toFixed(1)} KB`);
await page.close();

const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
const m = await mobile.newPage();
await m.goto(`${BASE}/tools/gujarat-police-photo`, { waitUntil: "networkidle" });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check("mobile: no horizontal scroll", overflow <= 0, `${overflow}px`);
await mobile.close();

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
