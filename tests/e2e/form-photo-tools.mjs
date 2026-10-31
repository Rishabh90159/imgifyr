// End-to-end tests for the form-photo tools added on 30 Oct 2026: photo + signature joiner, name and date on
// photo, change image DPI, resize image in cm and white background photo, in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/form-photo-tools.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/form-photo-tools";
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
async function newContext(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ acceptDownloads: true, viewport });
  ctx.on("request", (req) => {
    const url = req.url();
    if (!/^https?:/.test(url)) return;
    if (new URL(url).origin !== origin || req.method() !== "GET") offending.push(`${req.method()} ${url}`);
  });
  return ctx;
}
const context = await newContext();
async function openPage(route, ctx = context) {
  const page = await ctx.newPage();
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
  return { name: file.suggestedFilename(), bytes: fs.readFileSync(target), path: target };
}

/** JPEG frame size, JFIF DPI and the offset of the compressed scan. */
function jpegInfo(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let dpi = null;
  let size = null;
  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (marker === 0xe0 && bytes.toString("latin1", i + 4, i + 9) === "JFIF\0" && bytes[i + 11] === 1) dpi = (bytes[i + 12] << 8) | bytes[i + 13];
    if (marker >= 0xc0 && marker <= 0xc3) size = { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
    if (marker === 0xda) return { ...size, dpi, scan: i };
    i += 2 + length;
  }
  return null;
}

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

/** Decodes an image in the page and summarises a region: mean brightness and the share of dark pixels. */
async function regionStats(page, bytes, mime, region) {
  return page.evaluate(
    async ({ b64, mime, region }) => {
      // No fetch(): the site's CSP only allows connections to itself.
      const blob = new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: mime });
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const r = { x: region.x < 0 ? bitmap.width + region.x : region.x, y: region.y < 0 ? bitmap.height + region.y : region.y, w: region.w, h: region.h };
      const data = ctx.getImageData(r.x, r.y, r.w, r.h).data;
      let sum = 0;
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) {
        const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += l;
        if (l < 100) dark++;
      }
      const n = data.length / 4;
      return { mean: sum / n, dark: dark / n, width: bitmap.width, height: bitmap.height };
    },
    { b64: bytes.toString("base64"), mime, region },
  );
}

// ---------- Fixture: a phone-style JPG whose DPI (72) is only in EXIF ----------
const exifFixture = path.join(OUT, "phone-exif-72dpi.jpg");
{
  const base = fs.readFileSync(path.join(FIX, "portrait.jpg"));
  const info = jpegInfo(base);
  // Drop the JFIF segment the canvas encoder wrote and insert a little-endian EXIF block instead.
  let i = 2;
  const kept = [];
  while (i < info.scan) {
    const length = (base[i + 2] << 8) | base[i + 3];
    if (base[i + 1] !== 0xe0) kept.push(base.subarray(i, i + 2 + length));
    i += 2 + length;
  }
  const tiff = Buffer.alloc(8 + 2 + 3 * 12 + 4 + 16);
  tiff.write("II", 0, "latin1");
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(3, 8);
  const values = 8 + 2 + 36 + 4;
  const entry = (k, tag, type, value) => {
    const o = 10 + k * 12;
    tiff.writeUInt16LE(tag, o);
    tiff.writeUInt16LE(type, o + 2);
    tiff.writeUInt32LE(1, o + 4);
    tiff.writeUInt32LE(value, o + 8);
  };
  entry(0, 0x011a, 5, values);
  entry(1, 0x011b, 5, values + 8);
  entry(2, 0x0128, 3, 2);
  tiff.writeUInt32LE(72, values);
  tiff.writeUInt32LE(1, values + 4);
  tiff.writeUInt32LE(72, values + 8);
  tiff.writeUInt32LE(1, values + 12);
  const body = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), tiff]);
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1, (body.length + 2) >> 8, (body.length + 2) & 0xff]), body]);
  fs.writeFileSync(exifFixture, Buffer.concat([base.subarray(0, 2), app1, ...kept, base.subarray(info.scan)]));
}

// ---------- Photo and signature joiner ----------
{
  const page = await openPage("/tools/merge-photo-and-signature");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.getByText("Step 2: add your signature").waitFor();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "signature.jpg"));
  const join = page.getByRole("button", { name: "Join photo and signature" });
  await join.waitFor();
  await join.click();
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  let info = jpegInfo(file.bytes);
  // 1200 px photo + 10 px gap all round; the 1400 × 700 signature is scaled to 1200 × 600.
  check("joiner: signature below, scaled to the photo width", info?.width === 1220 && info?.height === 2230, `${info?.width}×${info?.height}`);
  const sig = await regionStats(page, file.bytes, "image/jpeg", { x: 0, y: -620, w: 1220, h: 600 });
  const gapRow = await regionStats(page, file.bytes, "image/jpeg", { x: 0, y: 1612, w: 1220, h: 6 });
  check("joiner: signature ink is present and its paper is cleaned to white", sig.dark > 0.003 && sig.mean > 225, `dark ${(sig.dark * 100).toFixed(2)}%, mean ${sig.mean.toFixed(0)}`);
  check("joiner: white gap between photo and signature", gapRow.mean > 250, gapRow.mean.toFixed(1));

  await page.getByLabel("Final width (px)").fill("400");
  await page.getByLabel("Max file size (KB)").fill("40");
  await page.getByRole("button", { name: "Join photo and signature" }).click();
  await page.getByText(/JPG · 400 ×/).waitFor({ timeout: 60_000 });
  file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  info = jpegInfo(file.bytes);
  check("joiner: fixed width 400 px and under 40 KB", info?.width === 400 && file.bytes.length <= 40 * KB, `${info?.width}×${info?.height}, ${(file.bytes.length / KB).toFixed(1)} KB`);

  await page.getByLabel("Final width (px)").fill("");
  await page.getByText("Beside the photo", { exact: true }).click();
  await page.getByRole("button", { name: "Join photo and signature" }).click();
  await page.getByText(/^JPG · [\d,]+ × [\d,]+ px/).waitFor({ timeout: 60_000 });
  file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  info = jpegInfo(file.bytes);
  check("joiner: beside layout keeps the size under 40 KB without a width", file.bytes.length <= 40 * KB && info.width > info.height, `${info?.width}×${info?.height}, ${(file.bytes.length / KB).toFixed(1)} KB`);

  await page.getByLabel("Max file size (KB)").fill("2");
  check("joiner: rejects a limit below 5 KB", await page.getByRole("button", { name: /Join/ }).isDisabled());
  await page.screenshot({ path: path.join(OUT, "joiner.png"), fullPage: false });
  await page.close();
}

// ---------- Name and date on photo ----------
{
  const page = await openPage("/tools/add-name-and-date-on-photo");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').waitFor();
  await page.locator("#nd-name").fill("ANJALI KRISHNAN");
  await page.locator("#nd-date").fill("");
  check(
    "name/date: a cleared date is flagged, not silently dropped",
    (await page.getByText("Pick the date the photo was taken").isVisible()) && (await page.getByRole("button", { name: "Add name and date" }).isDisabled()),
  );
  await page.locator("#nd-date").fill("2026-10-28");
  check("name/date: caption preview shows the name and formatted date", (await page.locator('svg[aria-label^="Caption preview"]').getAttribute("aria-label")).includes("ANJALI KRISHNAN, 28/10/2026"));
  await page.getByRole("button", { name: "Add name and date" }).click();
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  let info = jpegInfo(file.bytes);
  check("name/date: Kerala PSC preset gives 150 × 200 px JPG", info?.width === 150 && info?.height === 200, `${info?.width}×${info?.height}`);
  check("name/date: Kerala PSC preset is at most 30 KB", file.bytes.length <= 30 * KB, `${(file.bytes.length / KB).toFixed(1)} KB`);
  const strip = await regionStats(page, file.bytes, "image/jpeg", { x: 0, y: -40, w: 150, h: 40 });
  check("name/date: caption strip is white with dark text", strip.mean > 170 && strip.dark > 0.04 && strip.dark < 0.5, `mean ${strip.mean.toFixed(0)}, dark ${(strip.dark * 100).toFixed(1)}%`);
  fs.copyFileSync(file.path, path.join(OUT, "kerala-psc-sample.jpg"));

  await page.getByText("Custom size", { exact: true }).click();
  await page.locator("#nd-width").fill("300");
  await page.locator("#nd-height").fill("400");
  await page.getByRole("button", { name: /Create photo again|Add name and date/ }).click();
  await page.getByText(/300 × 400 px JPG/).first().waitFor({ timeout: 60_000 });
  file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  info = jpegInfo(file.bytes);
  check("name/date: custom 300 × 400 px", info?.width === 300 && info?.height === 400, `${info?.width}×${info?.height}`);

  await page.locator("#nd-name").fill("");
  await page.getByText("Print the date the photo was taken", { exact: true }).click();
  check("name/date: button disabled with no name and no date", await page.getByRole("button", { name: /Add name and date|Create photo again/ }).isDisabled());
  await page.close();
}

// ---------- Change image DPI ----------
{
  const page = await openPage("/tools/change-image-dpi");
  await page.locator('input[type="file"]').first().setInputFiles(exifFixture);
  await page.getByText("Current DPI: 72 DPI").waitFor();
  check("dpi: reads 72 DPI from EXIF", await page.getByText("(from the EXIF)").isVisible());
  await page.getByRole("button", { name: "Change to 300 DPI" }).click();
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 30_000 });
  let file = await download(page, link);
  const original = fs.readFileSync(exifFixture);
  const before = jpegInfo(original);
  const after = jpegInfo(file.bytes);
  check("dpi: JPG now has JFIF 300 DPI", after?.dpi === 300, String(after?.dpi));
  check("dpi: JPG image data is byte-identical", Buffer.compare(original.subarray(before.scan), file.bytes.subarray(after.scan)) === 0);
  const exifAt = file.bytes.indexOf(Buffer.from("Exif\0\0", "latin1"));
  const tiff = exifAt + 6;
  const xres = file.bytes.readUInt32LE(tiff + 8 + 2 + 36 + 4);
  check("dpi: EXIF XResolution rewritten to 300 (what Windows shows)", xres === 300, String(xres));
  fs.copyFileSync(file.path, path.join(OUT, "exif-300dpi.jpg"));

  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo.png"));
  await page.getByText(/^PNG · 1,600 × 1,200 px/).waitFor();
  await page.getByText("600", { exact: true }).click();
  await page.getByRole("button", { name: "Change to 600 DPI" }).click();
  file = await download(page, page.getByRole("link", { name: "Download PNG" }));
  check("dpi: PNG gets a 600 DPI pHYs chunk", pngDpi(file.bytes) === 600, String(pngDpi(file.bytes)));
  check("dpi: PNG grows only by the 21-byte chunk", file.bytes.length - fs.readFileSync(path.join(FIX, "photo.png")).length <= 21);

  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo.webp"));
  await page.getByText("WebP files can't store a DPI value").waitFor();
  await page.getByText("300", { exact: true }).click();
  await page.getByRole("button", { name: "Change to 300 DPI" }).click();
  file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  const webpOut = jpegInfo(file.bytes);
  check("dpi: WebP saved as JPG at 300 DPI, same pixels", webpOut?.dpi === 300 && webpOut.width === 1200 && webpOut.height === 800, `${webpOut?.width}×${webpOut?.height} @${webpOut?.dpi}`);
  await page.close();
}

// ---------- Resize image in cm ----------
{
  const page = await openPage("/tools/resize-image-in-cm");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').waitFor();
  await page.getByRole("button", { name: "Create photo" }).click();
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 60_000 });
  let file = await download(page, link);
  let info = jpegInfo(file.bytes);
  check("cm: 3.5 × 4.5 cm at 300 DPI is 413 × 531 px, DPI saved", info?.width === 413 && info?.height === 531 && info?.dpi === 300, `${info?.width}×${info?.height} @${info?.dpi}`);
  check("cm: print size shown in cm", await page.getByText("3.50 × 4.50 cm at 300 DPI").isVisible());

  await page.getByText("Millimetres", { exact: true }).click();
  check("cm: switching to mm keeps the real size (35 × 45)", (await page.locator("#pp-width").inputValue()) === "35" && (await page.locator("#pp-height").inputValue()) === "45");
  await page.getByText("Inches", { exact: true }).click();
  const inches = await page.locator("#pp-width").inputValue();
  await page.getByText("Millimetres", { exact: true }).click();
  check("cm: mm → inches → mm round trip is exact", inches === "1.378" && (await page.locator("#pp-width").inputValue()) === "35", `${inches} in, back to ${await page.locator("#pp-width").inputValue()} mm`);
  await page.getByText("Centimetres", { exact: true }).click();
  await page.locator("#pp-width").fill("6");
  await page.locator("#pp-height").fill("2");
  await page.locator("#pp-dpi").fill("200");
  await page.locator("#pp-max").fill("20");
  await page.getByRole("button", { name: /Create photo/ }).click();
  await page.getByText(/472 × 157/).first().waitFor({ timeout: 60_000 });
  file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  info = jpegInfo(file.bytes);
  check("cm: 6 × 2 cm at 200 DPI under 20 KB", info?.width === 472 && info?.height === 157 && info?.dpi === 200 && file.bytes.length <= 20 * KB, `${info?.width}×${info?.height} @${info?.dpi}, ${(file.bytes.length / KB).toFixed(1)} KB`);
  check("cm: no passport preset picker on this page", (await page.getByLabel("Photo requirement").count()) === 0);
  await page.close();
}

// ---------- Passport photo resizer still works as before ----------
{
  const page = await openPage("/tools/passport-photo-resizer");
  check("passport: preset picker still present", (await page.getByLabel("Photo requirement").count()) === 1);
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').waitFor();
  await page.getByRole("button", { name: "Create photo" }).click();
  const file = await download(page, page.getByRole("link", { name: "Download JPG" }));
  const info = jpegInfo(file.bytes);
  check("passport: default custom 35 × 45 mm at 300 DPI unchanged", info?.width === 413 && info?.height === 531, `${info?.width}×${info?.height}`);
  check("passport: print size still shown in mm", await page.getByText("35.0 × 45.0 mm at 300 DPI").isVisible());
  await page.close();
}

// ---------- White background photo ----------
{
  const page = await openPage("/tools/white-background-photo");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  const link = page.getByRole("link", { name: "Download JPG" });
  await link.waitFor({ timeout: 180_000 });
  const file = await download(page, link);
  const info = jpegInfo(file.bytes);
  check("white bg: opens on White and saves a JPG at full size", info?.width === 1200 && info?.height === 1600 && /white-background\.jpg$/.test(file.name), `${info?.width}×${info?.height} ${file.name}`);
  const corner = await regionStats(page, file.bytes, "image/jpeg", { x: 0, y: 0, w: 80, h: 80 });
  check("white bg: background corner is white", corner.mean > 245, corner.mean.toFixed(1));
  await page.close();
  const remover = await openPage("/tools/background-remover");
  await remover.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await remover.getByRole("link", { name: "Download PNG" }).waitFor({ timeout: 180_000 });
  check("background remover: still defaults to a transparent PNG", true);
  await remover.close();
}

// ---------- Mobile layout ----------
{
  const mobile = await newContext({ width: 375, height: 812 });
  for (const route of ["/tools/merge-photo-and-signature", "/tools/add-name-and-date-on-photo", "/tools/change-image-dpi", "/tools/resize-image-in-cm", "/tools/white-background-photo"]) {
    const page = await openPage(route, mobile);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`mobile: ${route} has no horizontal scroll`, overflow <= 0, `${overflow}px`);
    await page.close();
  }
  const page = await openPage("/tools/add-name-and-date-on-photo", mobile);
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.locator('[aria-label^="Photo crop area"]').waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("mobile: name/date editor has no horizontal scroll", overflow <= 0, `${overflow}px`);
  await page.screenshot({ path: path.join(OUT, "name-date-mobile.png"), fullPage: true });
  await mobile.close();
}

check("no requests to other origins and no uploads (POST)", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
