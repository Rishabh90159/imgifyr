// End-to-end tests for the UP Police constable page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/up-police.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/up-police";
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
await page.goto(`${BASE}/tools/up-police-photo`, { waitUntil: "networkidle" });

const summary = await page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");
check("UP Police: official UPPRPB notice linked", (await page.locator('a[href^="https://uppbpb.gov.in/"]').count()) >= 1);
check("UP Police: 30–50 KB, 140 × 60 and 50 mm × 20 mm shown", /30 KB – 50 KB/.test(summary) && /140 × 60/.test(summary) && summary.includes("50 mm × 20 mm"));
check("UP Police: live photo and no-uniform rules shown", summary.includes("real-time photo") && summary.includes("uniform"));
// The "checked <date>" line is when we verified the notice, so it is left out of this check.
const withoutCheckDate = summary.replace(/checked \d{1,2} \w+ \d{4}/, "");
check("UP Police: no year or 'previous notice' wording", !/2025|2026|previous|last year|isn't out yet/i.test(withoutCheckDate));

// A 140 × 60 JPEG can't reach 30 KB, so the tool offers a larger image with the same shape, as the notice allows 50 × 20 mm.
await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "signature.jpg"));
await page.getByRole("button", { name: "Create signature file" }).click();
const result = page.locator('section[aria-labelledby="result-heading"]');
await result.waitFor({ timeout: 60_000 });
const grow = result.getByRole("button", { name: /^Make it larger/ });
const offered = (await grow.count()) > 0;
if (offered) {
  await grow.first().click();
  await page.waitForFunction(() => /enlarged from/.test(document.querySelector('section[aria-labelledby="result-heading"]')?.textContent ?? ""), null, { timeout: 60_000 });
}
const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
const target = path.join(OUT, download.suggestedFilename());
await download.saveAs(target);
const bytes = fs.readFileSync(target);
const size = jpegSize(bytes);
const ratio = size ? size.width / size.height : 0;
check(
  "UP Police signature: enlarged to 30–50 KB, 140:60 shape",
  offered && bytes.length >= 30 * KB && bytes.length <= 50 * KB && Math.abs(ratio - 140 / 60) / (140 / 60) < 0.01,
  `${size?.width}×${size?.height}, ${(bytes.length / KB).toFixed(1)} KB, enlarge offered: ${offered}`,
);
await page.close();

const hub = await context.newPage();
await hub.goto(`${BASE}/tools/application-photos`, { waitUntil: "networkidle" });
const hrefs = await hub.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
check("Hub: UP Police listed", hrefs.includes("/tools/up-police-photo"));
await hub.close();

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
