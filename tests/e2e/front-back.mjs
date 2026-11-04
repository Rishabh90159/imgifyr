// End-to-end tests for the Aadhaar front-and-back page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/front-back.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/front-back";
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

const KB_ = (n) => `${(n / KB).toFixed(1)} KB`;

/** Adds front and back, applies the settings, combines and downloads. */
async function combine(page, { save, size, maxKB }) {
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.getByText("Step 2: add the back side").waitFor();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "batch-00.jpeg"));
  await page.getByRole("button", { name: "Combine front and back" }).waitFor();
  await page.getByText(save, { exact: true }).click();
  if (size) await page.getByText(size, { exact: true }).click();
  await page.getByLabel("Max file size (KB)").fill(maxKB ? String(maxKB) : "");
  await page.getByRole("button", { name: /Combine (front and back|again)/ }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download (PDF|JPG)/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  return { bytes: fs.readFileSync(target), text: await result.innerText() };
}

{
  const page = await open("/tools/aadhaar-front-and-back");
  check("page: says not affiliated with UIDAI", /Not affiliated with UIDAI/.test(await page.locator("main").innerText()));

  const pdf = await combine(page, { save: "PDF (A4 page)", size: "Card size", maxKB: 200 });
  const head = pdf.bytes.subarray(0, 8).toString("latin1");
  const body = pdf.bytes.toString("latin1");
  check("PDF: a one-page A4 PDF", head.startsWith("%PDF-") && /\/Count 1 /.test(body) && /\/MediaBox \[0 0 595\.28 841\.89\]/.test(body));
  const cm = body.match(/\n([\d. -]+) cm\n/)?.[1].split(" ").map(Number);
  check("PDF: card size puts each side 85.6 mm (242.65 pt) wide", cm && Math.abs(cm[0] - 242.65) < 0.5, cm?.join(" "));
  check("PDF: under the 200 KB limit", pdf.bytes.length <= 200 * KB, KB_(pdf.bytes.length));
  await page.screenshot({ path: path.join(OUT, "pdf-result.png"), fullPage: true });

  await page.reload({ waitUntil: "networkidle" });
  const jpg = await combine(page, { save: "JPG image", maxKB: 100 });
  const size = jpegSize(jpg.bytes);
  check("JPG: front above back, one image under 100 KB", jpg.bytes[0] === 0xff && jpg.bytes[1] === 0xd8 && size && size.height > size.width && jpg.bytes.length <= 100 * KB, `${size?.width}×${size?.height}, ${KB_(jpg.bytes.length)}`);
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
