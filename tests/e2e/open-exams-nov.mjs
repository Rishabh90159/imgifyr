// End-to-end tests for the KEA, Indian Bank and Central Railway apprentice pages, RRB Station Master and "Applications open now" in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/open-exams-nov.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/open-exams-nov";
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

/** Makes a file; accepts the offer to enlarge when it comes out under the minimum, as a user would. */
async function make(page, file, button, kindLabel) {
  if (kindLabel) await page.locator("#prepare").getByText(kindLabel, { exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByRole("button", { name: button }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const grow = result.getByRole("button", { name: /Enlarge|Increase|Make it/i });
  if (await grow.count()) {
    await grow.first().click();
    await page.waitForFunction(() => /enlarged from the/.test(document.querySelector('section[aria-labelledby="result-heading"]')?.textContent ?? ""), null, { timeout: 60_000 });
  }
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download JPG/ }).click()]);
  const target = path.join(OUT, download.suggestedFilename());
  await download.saveAs(target);
  const bytes = fs.readFileSync(target);
  return { bytes, size: jpegSize(bytes), text: await result.innerText() };
}

const kb = (b) => `${(b.length / KB).toFixed(1)} KB`;
const summaryText = (page) => page.locator('section[aria-labelledby="requirements-heading"]').evaluate((el) => el.textContent ?? "");

// ---------- KEA ----------
{
  const page = await open("/tools/kea-photo");
  const summary = await summaryText(page);
  check("KEA: notice linked on cetonline.karnataka.gov.in", (await page.locator('a[href^="https://cetonline.karnataka.gov.in/"]').count()) >= 1);
  check("KEA: photo 50–200 KB and signature 50–70 KB shown", /50 KB – 200 KB/.test(summary) && /50 KB – 70 KB/.test(summary));
  check("KEA: no pixel row invented", !/Pixel size/.test(summary));
  const photo = await make(page, "portrait.jpg", "Create photo file", "Photograph");
  check("KEA: photo is 50–200 KB", photo.bytes.length >= 50 * KB && photo.bytes.length <= 200 * KB, kb(photo.bytes));
  await page.reload({ waitUntil: "networkidle" });
  const sig = await make(page, "signature.jpg", "Create signature file", "Signature");
  const sigText = sig.text.replace(/s+/g, " ");
  check("KEA: signature is 50–70 KB, or the page says why not", (sig.bytes.length >= 50 * KB && sig.bytes.length <= 70 * KB) || /minimum|below|under/i.test(sigText), `${kb(sig.bytes)}: ${sigText.slice(0, 160)}`);
  await page.close();
}

// ---------- Indian Bank ----------
{
  const page = await open("/tools/indian-bank-photo");
  const summary = await summaryText(page);
  check("Indian Bank: advertisement linked on indianbank.bank.in", (await page.locator('a[href^="https://indianbank.bank.in/"]').count()) >= 1);
  check("Indian Bank: four files offered", ["Photograph", "Signature", "Left thumb impression", "Hand-written declaration"].every((t) => summary.includes(t)));
  const photo = await make(page, "portrait.jpg", "Create photo file", "Photograph");
  check("Indian Bank: photo is 200 × 230 and 20–50 KB", photo.size?.width === 200 && photo.size?.height === 230 && photo.bytes.length >= 20 * KB && photo.bytes.length <= 50 * KB, `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}

// ---------- RRC Central Railway ----------
{
  const page = await open("/tools/rrc-apprentice-photo");
  const summary = await summaryText(page);
  check("RRC: notification linked on rrccr.com", (await page.locator('a[href^="https://www.rrccr.com/"]').count()) >= 1);
  check("RRC: 3.5 cm × 3.5 cm, photo 20–70 KB, signature 20–30 KB", /3\.5 cm × 3\.5 cm/.test(summary) && /20 KB – 70 KB/.test(summary) && /20 KB – 30 KB/.test(summary));
  const photo = await make(page, "portrait.jpg", "Create photo file", "Photograph");
  check("RRC: photo is square and 20–70 KB", photo.size?.width === photo.size?.height && photo.bytes.length >= 20 * KB && photo.bytes.length <= 70 * KB, `${photo.size?.width}×${photo.size?.height}, ${kb(photo.bytes)}`);
  await page.close();
}

// ---------- RRB Station Master ----------
{
  const page = await open("/tools/rrb-photo");
  const summary = await summaryText(page);
  check("RRB: Station Master CEN 08/2026 listed with its 50 mm box", /08\/2026/.test(summary) && /50 mm × 20 mm/.test(summary) && /35 mm × 20 mm/.test(summary));
  await page.close();
}

// ---------- Applications open now ----------
{
  const page = await open("/");
  check("/: no exam deadline block on the homepage", (await page.locator('section[aria-labelledby="open-applications-heading"]').count()) === 0);
  const link = page.locator('section[aria-labelledby="photo-heading"] a', { hasText: /applications? open now/ });
  check("/: one text link to the exam hub with the open count", (await link.count()) === 1 && (await link.getAttribute("href")) === "/tools/application-photos" && /^\d+ exam applications open now/.test(await link.innerText()), await link.innerText().catch(() => ""));
  await page.close();
}
for (const route of ["/tools/application-photos"]) {
  const page = await open(route);
  const block = page.locator('section[aria-labelledby="open-applications-heading"]');
  const text = (await block.count()) ? await block.innerText() : "";
  const hrefs = await block.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check(`${route}: "Applications open now" links the open exam pages`, ["/tools/upessc-photo", "/tools/jee-main-photo", "/tools/kea-photo", "/tools/indian-bank-photo", "/tools/rrc-apprentice-photo", "/tools/rrb-photo"].every((h) => hrefs.includes(h)), hrefs.join(", "));
  check(`${route}: each entry shows its last date`, (text.match(/Apply by/g) ?? []).length === hrefs.length);
  if (await block.count()) await block.screenshot({ path: path.join(OUT, "open-now-hub.png") });
  await page.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
