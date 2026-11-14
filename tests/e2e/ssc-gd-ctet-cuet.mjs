// End-to-end tests for SSC GD on the SSC page and the pre-built CTET and CUET pages in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/ssc-gd-ctet-cuet.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/ssc-gd-ctet-cuet";
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

/** Picks the kind, adds a file, creates it (enlarging when it's under the minimum, as a user would) and downloads it. */
async function make(page, file, button, kindLabel) {
  if (kindLabel) await page.locator("#prepare").getByText(kindLabel, { exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const grow = result.getByRole("button", { name: /^Make it larger/ });
  if ((await grow.count()) > 0) {
    await grow.first().click();
    await page.waitForFunction(() => /enlarged from/.test(document.querySelector('section[aria-labelledby="result-heading"]')?.textContent ?? ""), null, { timeout: 60_000 });
  }
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  return { bytes, size: jpegSize(bytes) };
}
const kb = (b) => `${(b.length / KB).toFixed(1)} KB`;
const inRange = (b, min, max) => b.length >= min * KB && b.length <= max * KB;
const ratioOk = (s, r) => s && Math.abs(s.width / s.height - r) / r < 0.01;
const summaryText = (page) => page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");

// ---------- SSC GD ----------
{
  const page = await open("/tools/ssc-photo");
  const summary = await summaryText(page);
  check("SSC: GD listed and its notice linked", summary.includes("SSC GD Constable") && (await page.locator('a[href^="https://cdn.s3waas.gov.in/"]').count()) >= 1);
  check("SSC: GD signature at 300 DPI and horizontal rule shown", summary.includes("at 300 DPI") && summary.includes("horizontally aligned"));
  check("SSC: no 'notice not out yet' wording", !/isn't out yet|will be updated from/.test(summary));
  const sig = await make(page, "signature.jpg", "Create signature file");
  // JFIF header: density units at byte 13 (1 = dots per inch), X density at bytes 14–15.
  const dpi = sig.bytes[13] === 1 ? (sig.bytes[14] << 8) | sig.bytes[15] : 0;
  check("SSC GD signature: 3:1, 10–20 KB, 300 DPI", ratioOk(sig.size, 3) && inRange(sig.bytes, 10, 20) && dpi === 300, `${sig.size?.width}×${sig.size?.height}, ${kb(sig.bytes)}, ${dpi} DPI`);
  await page.close();
}

// ---------- CTET ----------
{
  const page = await open("/tools/ctet-photo");
  const summary = await summaryText(page);
  check("CTET: bulletin linked on cdnbbsr.s3waas.gov.in", (await page.locator('a[href^="https://cdnbbsr.s3waas.gov.in/"]').count()) >= 1);
  check("CTET: 10–100 KB, 3–30 KB and cm sizes shown", /10 KB – 100 KB/.test(summary) && /3 KB – 30 KB/.test(summary) && summary.includes("3.5 cm"));
  check("CTET: bulletin session stated", summary.includes("CTET September 2026 bulletin"));
  const photo = await make(page, "portrait.jpg", "Create photo file");
  check("CTET photo: 3.5:4.5, 10–100 KB", ratioOk(photo.size, 3.5 / 4.5) && inRange(photo.bytes, 10, 100), `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}
{
  const page = await open("/tools/ctet-photo");
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  check("CTET signature: 3.5:1.5, 3–30 KB", ratioOk(sig.size, 3.5 / 1.5) && inRange(sig.bytes, 3, 30), `${sig.size?.width}×${sig.size?.height}, ${kb(sig.bytes)}`);
  await page.close();
}

// ---------- CUET ----------
{
  const page = await open("/tools/cuet-photo");
  const summary = await summaryText(page);
  check("CUET: bulletin linked on cdnbbsr.s3waas.gov.in", (await page.locator('a[href^="https://cdnbbsr.s3waas.gov.in/"]').count()) >= 1);
  check("CUET: 10–200 KB photo and 10–50 KB signature shown", /10 KB – 200 KB/.test(summary) && /10 KB – 50 KB/.test(summary));
  check("CUET: bulletin year stated", summary.includes("CUET (UG) 2026 bulletin"));
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').first().waitFor({ timeout: 60_000 });
  check("CUET: 80% face guide shown", (await page.getByText("Face ≈ 80%").count()) === 1);
  await page.close();
}
{
  const page = await open("/tools/cuet-photo");
  const photo = await make(page, "portrait.jpg", "Create photo file");
  check("CUET photo: 10–200 KB", inRange(photo.bytes, 10, 200), `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}
{
  const page = await open("/tools/cuet-photo");
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  check("CUET signature: 10–50 KB", inRange(sig.bytes, 10, 50), `${sig.size?.width}×${sig.size?.height}, ${kb(sig.bytes)}`);
  await page.close();
}

// ---------- Hub ----------
{
  const page = await open("/tools/application-photos");
  const hrefs = await page.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check("Hub: CTET and CUET listed", hrefs.includes("/tools/ctet-photo") && hrefs.includes("/tools/cuet-photo"));
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
