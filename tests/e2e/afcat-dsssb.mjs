// End-to-end tests for the AFCAT 01/2027 page and DSSSB Advt 06/2026 in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/afcat-dsssb.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/afcat-dsssb";
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
  const name = download.suggestedFilename();
  const target = path.join(OUT, name);
  await download.saveAs(target);
  return { name, grown, bytes: fs.readFileSync(target), text: await result.innerText() };
}
const kb = (b) => `${(b.length / KB).toFixed(1)} KB`;
const inRange = (b, min, max) => b.length >= min * KB && b.length <= max * KB;
const summaryText = (page) => page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");

// ---------- AFCAT ----------
{
  const page = await open("/tools/afcat-photo");
  const summary = await summaryText(page);
  check("AFCAT: notification linked on afcat.edcil.co.in", (await page.locator('a[href^="https://afcat.edcil.co.in/"]').count()) >= 1);
  check("AFCAT: 100–200, 80–150 and 50–100 KB shown", /100 KB – 200 KB/.test(summary) && /80 KB – 150 KB/.test(summary) && /50 KB – 100 KB/.test(summary));
  check("AFCAT: thumb labelled for either hand, no pixel row", summary.includes("Thumb impression") && !summary.includes("Left thumb impression") && !/Pixel size/.test(summary));

  const photo = await make(page, "portrait.jpg", "Create photo file");
  check("AFCAT photo: named Passport Photograph.jpg, 100–200 KB", photo.name === "Passport Photograph.jpg" && inRange(photo.bytes, 100, 200), `${photo.name}, ${kb(photo.bytes)}`);
  await page.close();
}
{
  const page = await open("/tools/afcat-photo");
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  // A clean signature stays under 80 KB even at full quality; AFCAT sets no pixel size, so the tool offers to enlarge it.
  check("AFCAT signature: enlarged to reach 80 KB, named Signature.jpg, 80–150 KB", sig.grown && sig.name === "Signature.jpg" && inRange(sig.bytes, 80, 150), `${sig.name}, ${kb(sig.bytes)}, enlarged: ${sig.grown}`);
  await page.close();
}
{
  const page = await open("/tools/afcat-photo");
  const thumb = await make(page, "photo.jpeg", "Create thumb impression file", "Thumb impression");
  check("AFCAT thumb: named Thumb Impression.jpg, 50–100 KB", thumb.name === "Thumb Impression.jpg" && inRange(thumb.bytes, 50, 100), `${thumb.name}, ${kb(thumb.bytes)}`);
  await page.close();
}

// ---------- DSSSB 06/2026 ----------
{
  const page = await open("/tools/dsssb-photo");
  check("DSSSB: Advt 06/2026 notice linked", (await page.locator('a[href*="final_advt_06_2026"]').count()) >= 1);
  check("DSSSB: open window mentioned", (await page.getByText("until 11 December 2026").count()) >= 1);
  await page.close();
}

// ---------- Applications open now ----------
{
  const page = await open("/tools/application-photos");
  const hrefs = await page.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check("Hub: AFCAT listed and linked", hrefs.includes("/tools/afcat-photo"));
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
