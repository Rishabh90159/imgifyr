// End-to-end tests for the KCET (KEA UGCET) photo and signature page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/kcet.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/kcet";
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

async function make(page, file, button, kindLabel) {
  if (kindLabel) await page.locator("#prepare").getByText(kindLabel, { exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  return fs.readFileSync(target);
}

{
  const page = await open("/tools/kcet-photo");
  const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
  check("KCET: KEA guide linked on cetonline.karnataka.gov.in", (await page.locator('a[href^="https://cetonline.karnataka.gov.in/"]').count()) >= 1);
  check("KCET: up to 50 KB for photo and signature, JPG", (summary.match(/up to 50 KB/g) || []).length >= 2 && summary.includes("JPG"));
  check("KCET: no pixel size invented", !/Pixel size/.test(summary));
  check("KCET: no year or 'not out yet' wording", !/2025|2026|2027|isn't out yet|will be updated/i.test(summary.replace(/checked \d{1,2} \w+ \d{4}/, "")));
  const photo = await make(page, "portrait.jpg", "Create photo file");
  check("KCET photo: JPG under 50 KB", photo[0] === 0xff && photo[1] === 0xd8 && photo.length <= 50 * KB, `${(photo.length / KB).toFixed(1)} KB`);
  await page.close();
}
{
  const page = await open("/tools/kcet-photo");
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  check("KCET signature: JPG under 50 KB", sig[0] === 0xff && sig.length <= 50 * KB, `${(sig.length / KB).toFixed(1)} KB`);
  await page.close();
}
{
  const page = await open("/tools/kea-photo");
  check("KEA page links to KCET", (await page.locator('a[href="/tools/kcet-photo"]').count()) >= 1);
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
