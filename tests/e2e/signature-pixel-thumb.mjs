// End-to-end tests for the pixel-size, signature-size and thumb impression pages, the exam source line and the NTA face guide in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/signature-pixel-thumb.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/signature-pixel-thumb";
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

async function open(route) {
  const page = await context.newPage();
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${route}: ${m.text()}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return page;
}

/** Adds a file, presses the tool's create button and downloads the result. */
async function make(page, file, button) {
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByRole("button", { name: button }).waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  return { bytes, size: jpegSize(bytes) };
}
const kb = (b) => `${(b.length / KB).toFixed(1)} KB`;

// Pixel pages: exact size, and the KB range where the page sets one.
for (const [route, w, h, minKB, maxKB] of [
  ["/tools/200x230-photo", 200, 230, 20, 50],
  ["/tools/413x531-photo", 413, 531, 0, Infinity],
  ["/tools/630x810-photo", 630, 810, 0, Infinity],
  ["/tools/600x600-photo", 600, 600, 0, Infinity],
  ["/tools/thumb-impression-resizer", 240, 240, 20, 50],
]) {
  const page = await open(route);
  const r = await make(page, "portrait.jpg", /^Create photo$/);
  const okKB = r.bytes.length >= minKB * KB && r.bytes.length <= maxKB * KB;
  check(`${route}: ${w} × ${h} JPG${maxKB !== Infinity ? `, ${minKB}–${maxKB} KB` : ""}`, r.size?.width === w && r.size?.height === h && okKB, `${r.size?.width}×${r.size?.height}, ${kb(r.bytes)}`);
  await page.close();
}

// Signature pages: preset size and KB limit, signature not stretched.
for (const [route, w, h, maxKB] of [
  ["/tools/140x60-signature", 140, 60, 20],
  ["/tools/20kb-signature", null, null, 20],
  ["/tools/30kb-signature", null, null, 30],
]) {
  const page = await open(route);
  const r = await make(page, "signature.jpg", /^Create signature image$/);
  const okSize = w ? r.size?.width === w && r.size?.height === h : true;
  check(`${route}: ${w ? `${w} × ${h}, ` : ""}at or under ${maxKB} KB`, okSize && r.bytes.length <= maxKB * KB, `${r.size?.width}×${r.size?.height}, ${kb(r.bytes)}`);
  await page.close();
}

// Exam pages: the official notice is linked near the top, with a check date.
for (const route of ["/tools/ssc-photo", "/tools/ibps-photo", "/tools/rrb-photo", "/tools/kea-photo"]) {
  const page = await open(route);
  const line = page.locator('section[aria-labelledby="requirements-heading"] article p').first();
  const text = await line.innerText();
  check(`${route}: "Official notice … checked" line with a link`, /^Official notices?:/.test(text) && /checked \d/.test(text) && (await line.locator('a[href^="https://"]').count()) >= 1, text.slice(0, 120));
  await page.close();
}

// Government ID pages, from the official Sarathi PDF and ECI Form 6 guidelines.
{
  const page = await open("/tools/driving-licence-photo");
  check("Driving licence: Sarathi PDF linked", (await page.locator('a[href^="https://sarathi.parivahan.gov.in/"]').count()) >= 1);
  const photo = await make(page, "portrait.jpg", /^Create photo file$/);
  check("Driving licence: photo 420 × 525, 10–20 KB", photo.size?.width === 420 && photo.size?.height === 525 && photo.bytes.length >= 10 * KB && photo.bytes.length <= 20 * KB, `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}
{
  const page = await open("/tools/voter-id-photo");
  check("Voter ID: ECI guidelines linked", (await page.locator('a[href^="https://voters.eci.gov.in/"]').count()) >= 1);
  const photo = await make(page, "portrait.jpg", /^Create photo file$/);
  const ratio = photo.size ? photo.size.width / photo.size.height : 0;
  check("Voter ID: 3.5:4.5 photo under 2 MB", Math.abs(ratio - 35 / 45) < 0.01 && photo.bytes.length <= 2000 * KB, `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}

// NTA's "80% of the photo is the face": the oval guide and hint show on NEET and JEE photos only.
for (const [route, expected] of [["/tools/neet-photo", 1], ["/tools/jee-main-photo", 1], ["/tools/ibps-photo", 0]]) {
  const page = await open(route);
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').first().waitFor({ timeout: 60_000 });
  const oval = await page.getByText("Face ≈ 80%").count();
  const hint = await page.getByText("Face about 80% of the photo:").count();
  check(`${route}: face-coverage guide ${expected ? "shown" : "not shown"}`, oval === expected && hint === expected, `oval ${oval}, hint ${hint}`);
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
