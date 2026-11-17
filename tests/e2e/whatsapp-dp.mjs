// End-to-end tests for the WhatsApp DP without crop tool in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/whatsapp-dp.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/whatsapp-dp";
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

async function open() {
  const page = await context.newPage();
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  await page.goto(`${BASE}/tools/whatsapp-dp-without-crop`, { waitUntil: "networkidle" });
  return page;
}

/** Size, plus the colour at a few points (fractions of the side), measured in the browser from the downloaded JPG. */
async function inspect(page, bytes, points) {
  return page.evaluate(
    async ({ b64, points }) => {
      const bin = atob(b64);
      const raw = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
      const bitmap = await createImageBitmap(new Blob([raw], { type: "image/jpeg" }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const at = ([fx, fy]) => Array.from(ctx.getImageData(Math.floor(fx * (bitmap.width - 1)), Math.floor(fy * (bitmap.height - 1)), 1, 1).data.slice(0, 3));
      return { width: bitmap.width, height: bitmap.height, colours: points.map(at) };
    },
    { b64: bytes.toString("base64"), points },
  );
}

async function make(page, file, { shape, fill }) {
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, file));
  await page.getByText(shape === "circle" ? "Inside the circle" : "In the square", { exact: true }).waitFor({ timeout: 60_000 });
  await page.getByText(shape === "circle" ? "Inside the circle" : "In the square", { exact: true }).click();
  await page.getByText(fill, { exact: true }).click();
  await page.getByRole("button", { name: /^Create (DP|again)$/ }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 60_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download DP/ }).click()]);
  const target = path.join(OUT, `${shape}-${fill.toLowerCase().replace(/\s+/g, "-")}-${download.suggestedFilename()}`);
  await download.saveAs(target);
  return { name: download.suggestedFilename(), bytes: fs.readFileSync(target) };
}

const isWhite = (c) => c.every((v) => v > 245);
const isBlack = (c) => c.every((v) => v < 12);

// Tall photo, square fit, white background: the sides are background, the centre is photo.
{
  const page = await open();
  const dp = await make(page, "portrait.jpg", { shape: "square", fill: "White" });
  const r = await inspect(page, dp.bytes, [[0.02, 0.5], [0.98, 0.5], [0.5, 0.5], [0.5, 0.02]]);
  check("square fit: 1080 × 1080 JPG named whatsapp-dp", r.width === 1080 && r.height === 1080 && /whatsapp-dp\.jpg$/.test(dp.name) && dp.bytes[0] === 0xff, `${r.width}×${r.height}, ${dp.name}`);
  check("square fit, tall photo: white bars at the sides, whole height used", isWhite(r.colours[0]) && isWhite(r.colours[1]) && !isWhite(r.colours[2]) && !isWhite(r.colours[3]), JSON.stringify(r.colours));
  check("preview marks WhatsApp's round view", (await page.locator('[aria-label^="Preview: your whole photo"][aria-label*="round view"]').count()) === 1);
  await page.close();
}

// Wide photo, circle fit, black background: corners and the top and bottom are background; the centre is photo.
{
  const page = await open();
  const dp = await make(page, "photo.jpeg", { shape: "circle", fill: "Black" });
  const r = await inspect(page, dp.bytes, [[0.03, 0.03], [0.97, 0.97], [0.5, 0.08], [0.5, 0.5]]);
  check("circle fit: corners and top are background, centre is the photo", isBlack(r.colours[0]) && isBlack(r.colours[1]) && isBlack(r.colours[2]) && !isBlack(r.colours[3]), JSON.stringify(r.colours));
  await page.close();
}

// Blurred background: the bars are filled with the blurred photo, not a flat colour.
{
  const page = await open();
  const dp = await make(page, "portrait.jpg", { shape: "square", fill: "Blurred photo" });
  const r = await inspect(page, dp.bytes, [[0.02, 0.5], [0.98, 0.5]]);
  check("blurred background fills the sides with the photo", !isWhite(r.colours[0]) && !isBlack(r.colours[0]) && !isWhite(r.colours[1]), JSON.stringify(r.colours));
  await page.close();
}

// Phone: the upload box is on the first screen and there's no sideways scroll.
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await phone.newPage();
  await page.goto(`${BASE}/tools/whatsapp-dp-without-crop`, { waitUntil: "networkidle" });
  const m = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("label")].find((l) => /Choose image/.test(l.textContent || ""));
    return { wide: document.documentElement.scrollWidth > innerWidth, button: Math.round(btn.getBoundingClientRect().bottom) };
  });
  check("phone: Choose image on the first screen, no sideways scroll", !m.wide && m.button < 844, `button ends at ${m.button} px`);
  await phone.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
