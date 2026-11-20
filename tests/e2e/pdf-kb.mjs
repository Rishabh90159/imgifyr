// End-to-end tests for the "compress PDF to 100KB / 200KB / 500KB / 1MB" pages in a real browser (Edge by default).
// Each page must start at its own target and turn a 12.6 MB scanned PDF into a file within that size, with every page kept.
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/pdf-kb.mjs
import fs from "node:fs";
import { chromium } from "playwright-core";
import { PDFDocument } from "@cantoo/pdf-lib";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const SCAN = "tests/fixtures/generated/pdf-image-tools/scan.pdf";
if (!fs.existsSync(SCAN)) {
  console.error(`Missing ${SCAN}: run tests/e2e/pdf-image-tools.mjs once to generate it.`);
  process.exit(1);
}
const scanPages = (await PDFDocument.load(fs.readFileSync(SCAN))).getPageCount();

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
const origin = new URL(BASE).origin;
const offending = [];
const errors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});

const PAGES = [
  { path: "/tools/compress-pdf-to-100kb", label: "100 KB", bytes: 100 * 1024 },
  { path: "/tools/compress-pdf-to-200kb", label: "200 KB", bytes: 200 * 1024 },
  { path: "/tools/compress-pdf-to-500kb", label: "500 KB", bytes: 500 * 1024 },
  { path: "/tools/compress-pdf-to-1mb", label: "1.00 MB", bytes: 1024 * 1024 },
];

for (const p of PAGES) {
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + p.path, { waitUntil: "networkidle" });
  const button = page.getByRole("button", { name: `Compress to ${p.label}` });
  await page.locator('input[type="file"]').setInputFiles(SCAN);
  check(`${p.path}: starts at ${p.label}`, await button.isVisible());
  await button.click();
  await page.locator("#result-heading").waitFor({ timeout: 180_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator('a[download$=".pdf"]').first().click()]);
  const bytes = fs.readFileSync(await download.path());
  const pages = (await PDFDocument.load(bytes)).getPageCount();
  check(`${p.path}: 12.6 MB scan comes out within ${p.label}, all ${scanPages} pages kept`, bytes.length <= p.bytes && pages === scanPages, `${Math.round(bytes.length / 1024)} KB, ${pages} pages`);
  await page.close();
}

// The general compressor keeps its 200 KB default and links to every size page.
{
  const page = await context.newPage();
  await page.goto(BASE + "/tools/compress-pdf", { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles(SCAN);
  check("/tools/compress-pdf: still starts at 200 KB", await page.getByRole("button", { name: "Compress to 200 KB" }).isVisible());
  const links = await page.locator("main a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check("/tools/compress-pdf: links to all four size pages", PAGES.every((x) => links.includes(x.path)));
  await page.close();
}

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
