// End-to-end tests for the pages added on 31 Oct 2026: transparent signature, circle crop, JPG/PNG to WebP,
// WebP to PNG, HEIC to PNG, PDF to PNG, and the KB limit on PNG to JPG. Each downloaded file is checked.
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/new-tools-oct31.mjs
// Needs the PDF fixtures from tests/e2e/pdf-image-tools.mjs (run that suite once first).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/new-tools-oct31";
const KB = 1024;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
if (!fs.existsSync(path.join(FIX, "portrait.jpg"))) {
  await generateFixtures(browser, FIX);
  await generatePhase2Fixtures(browser, FIX);
}
const origin = new URL(BASE).origin;
const offending = [];
const consoleErrors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (!/^https?:/.test(url)) return;
  if (new URL(url).origin !== origin || req.method() !== "GET") offending.push(`${req.method()} ${url}`);
});

async function openPage(route) {
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`${route}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`${route}: ${err.message}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return page;
}
async function download(page, locator) {
  const [file] = await Promise.all([page.waitForEvent("download"), locator.click()]);
  const target = path.join(OUT, file.suggestedFilename());
  await file.saveAs(target);
  return { name: file.suggestedFilename(), bytes: fs.readFileSync(target) };
}
const isPng = (b) => b.length > 8 && b.readUInt32BE(0) === 0x89504e47;
const isJpeg = (b) => b[0] === 0xff && b[1] === 0xd8;
const isWebp = (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP";

/** pHYs DPI of a PNG. */
function pngDpi(bytes) {
  let o = 8;
  while (o < bytes.length) {
    const len = bytes.readUInt32BE(o);
    const type = bytes.toString("latin1", o + 4, o + 8);
    if (type === "pHYs") return Math.round(bytes.readUInt32BE(o + 8) * 0.0254);
    if (type === "IDAT") return null;
    o += 12 + len;
  }
  return null;
}

/** Decodes an image in the page; returns its size and the RGBA of the given pixels (negative = from the far edge). */
async function pixels(page, bytes, mime, points) {
  return page.evaluate(
    async ({ b64, mime, points }) => {
      // No fetch(): the site's CSP only allows connections to itself.
      const blob = new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: mime });
      const bitmap = await createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" });
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const at = ([x, y]) => [...ctx.getImageData(x < 0 ? bitmap.width + x : x, y < 0 ? bitmap.height + y : y, 1, 1).data];
      /** Darkest opaque pixel, to find the ink of a signature. */
      const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
      let ink = null;
      let best = 999;
      let transparent = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) transparent++;
        const l = data[i] + data[i + 1] + data[i + 2];
        if (data[i + 3] === 255 && l < best) {
          best = l;
          ink = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        }
      }
      return { width: bitmap.width, height: bitmap.height, points: points.map(at), ink, transparentShare: transparent / (data.length / 4) };
    },
    { b64: bytes.toString("base64"), mime, points },
  );
}

// ---------- Transparent signature ----------
{
  const page = await openPage("/tools/transparent-signature");
  check("signature: H1", (await page.locator("h1").innerText()) === "Transparent Signature Maker");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "signature.jpg"));
  await page.locator('[aria-label^="Signature crop area"]').waitFor();
  check("signature: starts on Transparent (PNG)", await page.getByText("Output format: PNG (needed for a transparent background).").isVisible());
  await page.getByRole("button", { name: "Create signature image" }).click();
  let link = page.getByRole("link", { name: "Download PNG" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  let px = await pixels(page, file.bytes, "image/png", [[2, 2]]);
  check("signature: PNG with transparent paper", isPng(file.bytes) && px.points[0][3] === 0 && px.transparentShare > 0.5, `${(px.transparentShare * 100).toFixed(0)}% transparent`);
  check("signature: dark ink kept opaque", px.ink && px.ink[0] + px.ink[1] + px.ink[2] < 200, JSON.stringify(px.ink));
  check("signature: file name says transparent", /transparent-signature-\d+x\d+\.png$/.test(file.name), file.name);

  await page.getByText("Blue", { exact: true }).click();
  await page.getByRole("button", { name: /Create signature/ }).click();
  await page.waitForFunction(() => document.querySelector("#result-heading") !== null);
  link = page.getByRole("link", { name: "Download PNG" });
  await link.waitFor({ timeout: 60_000 });
  file = await download(page, link);
  px = await pixels(page, file.bytes, "image/png", [[2, 2]]);
  check("signature: Blue makes every ink pixel the same blue", px.ink && px.ink[0] === 16 && px.ink[1] === 46 && px.ink[2] === 160 && px.points[0][3] === 0, JSON.stringify(px.ink));
  await page.close();
}

// ---------- Signature resizer keeps its old defaults ----------
{
  const page = await openPage("/tools/signature-resizer");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "signature.jpg"));
  await page.locator('[aria-label^="Signature crop area"]').waitFor();
  check("signature-resizer: still starts on Clean white with JPG", (await page.getByRole("radio", { name: "Clean white" }).isChecked()) && (await page.getByRole("radio", { name: "JPG" }).isChecked()));
  await page.getByRole("button", { name: "Create signature image" }).click();
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  const file = await download(page, link);
  check("signature-resizer: JPG, old file name", isJpeg(file.bytes) && /-signature-\d+x\d+\.jpg$/.test(file.name) && !file.name.includes("transparent"), file.name);
  await page.close();
}

// ---------- Circle crop ----------
{
  const page = await openPage("/tools/circle-crop");
  check("circle: H1", (await page.locator("h1").innerText()) === "Circle Crop Image");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Circle crop area"]').waitFor();
  await page.getByRole("button", { name: "Crop to circle" }).click();
  let link = page.getByRole("link", { name: "Download PNG" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  let px = await pixels(page, file.bytes, "image/png", [[0, 0], [-1, -1], [0.5, 0.5]]);
  const centre = await pixels(page, file.bytes, "image/png", [[Math.floor(px.width / 2), Math.floor(px.height / 2)]]);
  check("circle: square transparent PNG", isPng(file.bytes) && px.width === px.height && px.width > 100, `${px.width}×${px.height}`);
  check("circle: corners transparent, centre opaque", px.points[0][3] === 0 && px.points[1][3] === 0 && centre.points[0][3] === 255);
  // A circle covers π/4 of the square, so about 21.5% is transparent.
  check("circle: about 21.5% of the square is transparent", Math.abs(px.transparentShare - (1 - Math.PI / 4)) < 0.01, `${(px.transparentShare * 100).toFixed(1)}%`);

  await page.getByText("500 px", { exact: true }).click();
  await page.getByText("White JPG", { exact: true }).click();
  await page.getByText("Thick", { exact: true }).click();
  await page.getByRole("button", { name: /Crop/ }).last().click();
  link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  file = await download(page, link);
  px = await pixels(page, file.bytes, "image/jpeg", [[0, 0], [-1, -1], [250, 3]]);
  check("circle: 500 × 500 JPG", isJpeg(file.bytes) && px.width === 500 && px.height === 500, `${px.width}×${px.height}`);
  check("circle: white corners and a white border at the top edge", px.points[0].slice(0, 3).every((v) => v > 245) && px.points[1].slice(0, 3).every((v) => v > 245) && px.points[2].slice(0, 3).every((v) => v > 235), JSON.stringify(px.points));
  await page.close();
}

// ---------- JPG / PNG to WebP ----------
{
  const page = await openPage("/tools/jpg-to-webp");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo-12mp.jpg"));
  let link = page.getByRole("link", { name: "Download WebP" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  const original = fs.statSync(path.join(FIX, "photo-12mp.jpg")).size;
  check("webp: JPG becomes a WebP file", isWebp(file.bytes) && file.name.endsWith(".webp"), `${file.name}, ${(file.bytes.length / KB).toFixed(0)} KB from ${(original / KB).toFixed(0)} KB`);

  await page.getByText("100 KB", { exact: true }).click();
  // A new setting hides the old result until the image is converted again.
  await link.waitFor({ state: "detached" });
  await page.getByRole("button", { name: /Convert to WebP/ }).click();
  link = page.getByRole("link", { name: "Download WebP" });
  await link.waitFor({ timeout: 120_000 });
  file = await download(page, link);
  check("webp: 100 KB limit met", isWebp(file.bytes) && file.bytes.length <= 100 * KB, `${(file.bytes.length / KB).toFixed(1)} KB`);
  await page.close();

  const page2 = await openPage("/tools/jpg-to-webp");
  await page2.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "transparent.png"));
  link = page2.getByRole("link", { name: "Download WebP" });
  await link.waitFor({ timeout: 60_000 });
  file = await download(page2, link);
  const px = await pixels(page2, file.bytes, "image/webp", [[0, 0]]);
  check("webp: PNG transparency kept", isWebp(file.bytes) && px.transparentShare > 0.05, `${(px.transparentShare * 100).toFixed(0)}% transparent`);
  await page2.close();
}

// ---------- WebP to PNG ----------
{
  const page = await openPage("/tools/webp-to-png");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "webp-transparent.webp"));
  const link = page.getByRole("link", { name: "Download PNG" });
  await link.waitFor({ timeout: 60_000 });
  const file = await download(page, link);
  const before = await pixels(page, fs.readFileSync(path.join(FIX, "webp-transparent.webp")), "image/webp", []);
  const px = await pixels(page, file.bytes, "image/png", []);
  check("webp2png: PNG of the same size", isPng(file.bytes) && px.width === before.width && px.height === before.height, `${px.width}×${px.height}`);
  check("webp2png: transparency kept exactly", px.transparentShare > 0.05 && Math.abs(px.transparentShare - before.transparentShare) < 0.001, `${(px.transparentShare * 100).toFixed(1)}% vs ${(before.transparentShare * 100).toFixed(1)}%`);
  await page.close();
}

// ---------- HEIC to PNG ----------
{
  const page = await openPage("/tools/heic-to-png");
  await page.locator('input[type="file"]').first().setInputFiles("tests/fixtures/heic/example.heic");
  const link = page.getByRole("link", { name: "Download PNG" });
  await link.waitFor({ timeout: 120_000 });
  const file = await download(page, link);
  const px = await pixels(page, file.bytes, "image/png", []);
  check("heic2png: iPhone HEIC becomes a PNG", isPng(file.bytes) && px.width > 0 && file.name.endsWith(".png"), `${file.name}, ${px.width}×${px.height}`);
  await page.close();
}

// ---------- PDF to PNG ----------
{
  const pdf = path.join(FIX, "pdf-image-tools", "text.pdf");
  if (!fs.existsSync(pdf)) {
    check("pdf2png: fixture text.pdf exists (run pdf-image-tools.mjs first)", false);
  } else {
    const page = await openPage("/tools/pdf-to-png");
    await page.locator('input[type="file"]').setInputFiles(pdf);
    // Settings appear once a file is chosen.
    await page.getByText("Resolution").first().waitFor();
    check("pdf2png: resolution offered, no size limit (PNG is lossless)", (await page.getByText("150 DPI", { exact: true }).count()) === 1 && (await page.getByText("Maximum size per image", { exact: true }).count()) === 0);
    await page.getByRole("button", { name: "Convert to PNG" }).click();
    await page.locator("#result-heading").waitFor({ timeout: 120_000 });
    const file = await download(page, page.locator('a[download$=".png"]'));
    const px = await pixels(page, file.bytes, "image/png", [[5, 5]]);
    check("pdf2png: one page gives text.png", file.name === "text.png" && isPng(file.bytes), file.name);
    check("pdf2png: A4 at 150 DPI is about 1240 × 1754 px", Math.abs(px.width - 1240) <= 2 && Math.abs(px.height - 1754) <= 2, `${px.width}×${px.height}`);
    check("pdf2png: PNG records 150 DPI and a white page", pngDpi(file.bytes) === 150 && px.points[0].join() === "255,255,255,255", `${pngDpi(file.bytes)} dpi`);
    await page.close();

    const jpgPage = await openPage("/tools/pdf-to-jpg");
    await jpgPage.locator('input[type="file"]').setInputFiles(pdf);
    await jpgPage.getByText("Resolution").first().waitFor();
    check("pdf2jpg: still offers a size limit", (await jpgPage.getByText("Maximum size per image", { exact: true }).count()) === 1);
    await jpgPage.close();
  }
}

// ---------- PNG to JPG under a KB limit ----------
{
  const page = await openPage("/tools/png-to-jpg");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo.png"));
  let link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  const originalSize = fs.statSync(path.join(FIX, "photo.png")).size;
  await page.getByText("50 KB", { exact: true }).click();
  await link.waitFor({ state: "detached" });
  await page.getByRole("button", { name: /Convert to JPG/ }).click();
  link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 120_000 });
  const file = await download(page, link);
  check("png2jpg: 50 KB limit met", isJpeg(file.bytes) && file.bytes.length <= 50 * KB, `${(file.bytes.length / KB).toFixed(1)} KB from ${(originalSize / KB).toFixed(0)} KB`);
  await page.close();
}

// ---------- Mobile layout ----------
{
  const mobile = await browser.newContext({ viewport: { width: 360, height: 760 } });
  for (const route of ["/tools/transparent-signature", "/tools/circle-crop", "/tools/jpg-to-webp", "/tools/webp-to-png", "/tools/heic-to-png", "/tools/pdf-to-png"]) {
    const page = await mobile.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`mobile: ${route} has no sideways scroll`, overflow <= 0, `${overflow}px`);
    await page.close();
  }
  await mobile.close();
}

check("no image left the device (only same-origin GETs)", offending.length === 0, offending.slice(0, 3).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
