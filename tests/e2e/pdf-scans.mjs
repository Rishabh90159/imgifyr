// Scanned PDFs whose pages are fax-compressed (CCITT Group 4) images, as many government notices are, must render with
// content, not as blank pages, in PDF to JPG, PDF to PNG and Compress PDF. Runs in a real browser (Edge by default).
// The fixture tests/fixtures/scans/ccitt-scan.pdf is synthetic: a drawn test page saved as a CCITT G4 TIFF by Windows
// imaging and wrapped in a one-page PDF with pdf-lib.
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/pdf-scans.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const SCAN = "tests/fixtures/scans/ccitt-scan.pdf";
const OUT = "tests/e2e/output/pdf-scans";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
const origin = new URL(BASE).origin;
const offending = [];
const consoleErrors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});

async function open(route) {
  const page = await context.newPage();
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${route}: ${m.text()}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return page;
}

async function download(page, locator) {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator(locator).first().click()]);
  const target = path.join(OUT, dl.suggestedFilename());
  await dl.saveAs(target);
  return { name: dl.suggestedFilename(), bytes: fs.readFileSync(target) };
}

/** Share of dark pixels in an image file, measured in the browser. A blank page gives 0. */
async function darkShare(page, bytes, mime) {
  return page.evaluate(
    async ({ b64, mime }) => {
      // Built from bytes: the site's CSP (connect-src 'self') rightly blocks fetching data: URLs.
      const bin = atob(b64);
      const raw = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
      const blob = new Blob([raw], { type: mime });
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] < 300) dark++;
      return dark / (data.length / 4);
    },
    { b64: bytes.toString("base64"), mime },
  );
}

// The test page has a heading, 20 lines of text and a solid black bar: well over 2% of it is dark.
const MIN_DARK = 0.02;

// ---------- PDF to JPG ----------
{
  const page = await open("/tools/pdf-to-jpg");
  await page.locator('input[type="file"]').setInputFiles(SCAN);
  await page.getByRole("button", { name: "Convert to JPG" }).click();
  const file = await download(page, 'a[download$=".jpg"]');
  const share = await darkShare(page, file.bytes, "image/jpeg");
  check("PDF to JPG: fax-compressed scan renders with content, not blank", share > MIN_DARK, `${(share * 100).toFixed(1)}% dark`);
  await page.close();
}

// ---------- PDF to PNG ----------
{
  const page = await open("/tools/pdf-to-png");
  await page.locator('input[type="file"]').setInputFiles(SCAN);
  await page.getByRole("button", { name: /^Convert to PNG/ }).click();
  const file = await download(page, 'a[download$=".png"]');
  const share = await darkShare(page, file.bytes, "image/png");
  check("PDF to PNG: fax-compressed scan renders with content, not blank", share > MIN_DARK, `${(share * 100).toFixed(1)}% dark`);
  await page.close();
}

// ---------- Compress PDF, then back to JPG to see what it kept ----------
{
  const page = await open("/tools/compress-pdf");
  await page.locator('input[type="file"]').setInputFiles(SCAN);
  await page.getByRole("button", { name: /^Compress/ }).first().click();
  const compressed = await download(page, 'a[download$=".pdf"]');
  await page.close();
  const target = path.join(OUT, "compressed-scan.pdf");
  fs.writeFileSync(target, compressed.bytes);
  const back = await open("/tools/pdf-to-jpg");
  await back.locator('input[type="file"]').setInputFiles(target);
  await back.getByRole("button", { name: "Convert to JPG" }).click();
  const file = await download(back, 'a[download$=".jpg"]');
  const share = await darkShare(back, file.bytes, "image/jpeg");
  check("Compress PDF: the scan keeps its content", share > MIN_DARK, `${(share * 100).toFixed(1)}% dark, ${(compressed.bytes.length / 1024).toFixed(0)} KB`);
  await back.close();
}

check("decoders load from this site only: no other origins, no uploads", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
