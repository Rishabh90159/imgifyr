// End-to-end tests for the Indian visa photo page in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/india-visa.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

/** Pixel size from a JPEG's start-of-frame marker. */
function readJpegSize(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    const length = (b[i + 2] << 8) | b[i + 3];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
    }
    i += 2 + length;
  }
  return null;
}

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/india-visa";
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
const errors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});

const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE + "/tools/india-visa-photo", { waitUntil: "networkidle" });

const summary = await page.locator('section[aria-labelledby="requirements-heading"]').innerText();
check("official visa photo guide is linked", (await page.locator('a[href="https://indianvisaonline.gov.in/visa/VSS_IMAGE.pdf"]').count()) >= 1);
check("summary shows the published limits", /10 KB/.test(summary) && /300 KB/.test(summary) && /350 × 350/.test(summary) && /JPEG/.test(summary), summary.split("\n").slice(0, 6).join(" | "));
check("no e-Visa size is claimed", !/1 MB|1MB/.test(await page.locator("main").innerText()));

await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
await page.getByRole("button", { name: "Create photo file" }).click();
const result = page.locator('section[aria-labelledby="result-heading"]');
await result.waitFor({ timeout: 60_000 });
const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
const target = path.join(OUT, download.suggestedFilename());
await download.saveAs(target);
const bytes = fs.readFileSync(target);
const size = readJpegSize(bytes);
check(
  "a phone portrait becomes a square JPEG of 350–1000 px and 10–300 KB",
  bytes[0] === 0xff && bytes[1] === 0xd8 && size && size.width === size.height && size.width >= 350 && size.width <= 1000 && bytes.length >= 10 * KB && bytes.length <= 300 * KB,
  size ? `${size.width} × ${size.height}, ${(bytes.length / KB).toFixed(1)} KB` : "not a JPEG",
);

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
