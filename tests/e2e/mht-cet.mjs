// End-to-end tests for the MHT CET photo page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/mht-cet.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/mht-cet";
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
await page.goto(`${BASE}/tools/mht-cet-photo`, { waitUntil: "networkidle" });

const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
check("MHT CET: State CET Cell brochure linked", (await page.locator('a[href^="https://cetcell.mahacet.org/"]').count()) >= 1);
check("MHT CET: 2 × 2 inch and 100 KB – 5 MB shown", summary.includes("2 inch × 2 inch") && /100 KB – 5 MB/.test(summary));
check("MHT CET: photo only, no signature option", (await page.getByText("Signature", { exact: true }).count()) === 0 && summary.includes("no signature upload"));
check("MHT CET: no pixel size or format invented", !/Pixel size/.test(summary) && /Not stated/.test(summary));
check("MHT CET: no year or 'not out yet' wording", !/2025|2026|2027|isn't out yet|will be updated/i.test(summary.replace(/checked \d{1,2} \w+ \d{4}/, "")));

await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
await page.locator('[aria-label^="Photo crop area"]').first().waitFor({ timeout: 60_000 });
check("MHT CET: 80% face guide and hint shown", (await page.getByText("Face ≈ 80%").count()) === 1 && (await page.getByText("as the MHT CET instructions ask").count()) === 1);

await page.getByRole("button", { name: "Create photo file" }).click();
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
const size = jpegSize(bytes);
check(
  "MHT CET photo: square, 100 KB – 5 MB",
  size && size.width === size.height && bytes.length >= 100 * KB && bytes.length <= 5120 * KB,
  `${size?.width}×${size?.height}, ${(bytes.length / KB).toFixed(1)} KB`,
);
await page.close();

const hub = await context.newPage();
await hub.goto(`${BASE}/tools/application-photos`, { waitUntil: "networkidle" });
const hrefs = await hub.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
check("Hub: MHT CET listed", hrefs.includes("/tools/mht-cet-photo"));
await hub.close();

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
