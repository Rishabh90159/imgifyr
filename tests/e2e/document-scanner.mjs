// End-to-end tests for the document scanner in a real browser (Edge by default), with generated "phone photos":
// a tilted, shadowed page of text lying on a dark table.
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/document-scanner.mjs
import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "@cantoo/pdf-lib";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const OUT = "tests/e2e/output/document-scanner";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
const origin = new URL(BASE).origin;
const offending = [];
const errors = [];

// The page corners in the generated photo (2400 × 3200), clockwise from top-left.
const CORNERS = [
  [520, 420],
  [1980, 560],
  [1880, 2860],
  [380, 2700],
];

async function makePhoto(page, file, seed, scale = 1) {
  const b64 = await page.evaluate(
    async ({ corners, seed, scale }) => {
      const c = new OffscreenCanvas(2400 * scale, 3200 * scale);
      const ctx = c.getContext("2d");
      ctx.scale(scale, scale);
      // Wooden table.
      ctx.fillStyle = "#4a3426";
      ctx.fillRect(0, 0, 2400, 3200);
      for (let y = 0; y < 3200; y += 40) {
        ctx.fillStyle = y % 80 ? "#523a2b" : "#43301f";
        ctx.fillRect(0, y, 2400, 18);
      }
      // The page, slightly warm paper.
      ctx.beginPath();
      corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = "#e9e3d6";
      ctx.fill();
      ctx.save();
      ctx.clip();
      // Lines of "text", tilted with the page.
      ctx.translate(520, 420);
      ctx.rotate(Math.atan2(140, 1460));
      ctx.fillStyle = "#1c1c28";
      for (let line = 0; line < 22; line++) {
        const w = 900 + ((line * 137 + seed * 71) % 400);
        ctx.fillRect(140, 260 + line * 95, w, 26);
      }
      ctx.restore();
      // A shadow across the lower right, like a phone held over the page.
      const g = ctx.createLinearGradient(900, 1500, 2100, 3000);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2400, 3200);
      const blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.9 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    },
    { corners: CORNERS, seed, scale },
  );
  const target = path.join(OUT, file);
  fs.writeFileSync(target, Buffer.from(b64, "base64"));
  return target;
}

const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(BASE + "/tools/document-scanner", { waitUntil: "networkidle" });
const photo1 = await makePhoto(page, "page-1.jpg", 1);
const photo2 = await makePhoto(page, "page-2.jpg", 2);

// Only "Choose images" for now: the direct camera button lost photos on the owner's phone, so it was removed.
// Phones get a tip to use the camera app first; desktops see just the upload box.
check("desktop: only the upload box, no camera button or tip", (await page.getByRole("button", { name: "Take a photo" }).count()) === 0 && (await page.getByText("camera app").count()) === 0);
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await phone.newPage();
  await p.goto(BASE + "/tools/document-scanner", { waitUntil: "networkidle" });
  await p.getByText("photograph the page with your camera app first").waitFor({ timeout: 10_000 });
  const cameraInputs = await p.locator('input[capture]').count();
  check("phone: no camera button, a tip to take the photo first and choose it", (await p.getByRole("button", { name: "Take a photo" }).count()) === 0 && cameraInputs === 0);
  await phone.close();
}

await page.locator('input[type="file"]').first().setInputFiles([photo1, photo2]);
await page.getByRole("heading", { name: /Page 1: drag the corners/ }).waitFor({ timeout: 30_000 });
check("two photos become two pages", (await page.getByRole("button", { name: /^Page \d$/ }).count()) === 2);

// The automatic corners match the page's real corners (as fractions of the photo).
const handles = await page.locator('[role="slider"][aria-label$="corner"]').evaluateAll((els) =>
  els.map((el) => {
    const m = el.getAttribute("aria-valuetext").match(/(\d+)% across, (\d+)% down/);
    return [Number(m[1]) / 100, Number(m[2]) / 100];
  }),
);
const expected = CORNERS.map(([x, y]) => [x / 2400, y / 3200]);
const worst = Math.max(...handles.map((h, i) => Math.hypot(h[0] - expected[i][0], h[1] - expected[i][1])));
check("page corners are found automatically", handles.length === 4 && worst < 0.03, `worst corner off by ${(worst * 100).toFixed(1)}% of the photo`);

// The outline is drawn over the photo itself: photo and overlay boxes coincide and keep the photo's shape, at a
// tall-screen-limited size too (a mismatch once made correct corners look inset from the page).
for (const vh of [900, 560]) {
  await page.setViewportSize({ width: 1280, height: vh });
  const fit = await page.locator("[data-corner-editor]").evaluate((box) => {
    const img = box.querySelector("img").getBoundingClientRect();
    const svg = box.querySelector("svg").getBoundingClientRect();
    const [, , w, h] = box.querySelector("svg").getAttribute("viewBox").split(" ").map(Number);
    return { dx: Math.abs(img.width - svg.width) + Math.abs(img.left - svg.left), dy: Math.abs(img.height - svg.height) + Math.abs(img.top - svg.top), ratio: img.width / img.height, want: w / h };
  });
  check(`corner overlay matches the photo (window ${vh}px tall)`, fit.dx < 1 && fit.dy < 1 && Math.abs(fit.ratio - fit.want) < 0.01, `ratio ${fit.ratio.toFixed(3)} vs ${fit.want.toFixed(3)}`);
}
await page.setViewportSize({ width: 1280, height: 900 });

// Keyboard nudging of a corner works (accessibility) and the preview follows.
await page.locator('[role="slider"][aria-label="Top-left corner"]').focus();
const before = await page.locator('[role="slider"][aria-label="Top-left corner"]').getAttribute("aria-valuetext");
await page.keyboard.press("ArrowRight");
const after = await page.locator('[role="slider"][aria-label="Top-left corner"]').getAttribute("aria-valuetext");
check("a corner can be moved with the arrow keys", before !== after, `${before} → ${after}`);
await page.keyboard.press("ArrowLeft");

// The cleaned preview: no table left at the edges, white paper even in the shadow, dark text lines.
await page.waitForTimeout(1500);
await page.locator("#prepare").getByText("Black & white", { exact: true }).click();
await page.waitForTimeout(2000);
const stats = await page.getByRole("button", { name: "Page 1" }).locator("img").evaluate(async (img) => {
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const at = (fx, fy) => d[(Math.floor(fy * (c.height - 1)) * c.width + Math.floor(fx * (c.width - 1))) * 4];
  let white = 0;
  let black = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 230) white++;
    else if (d[i] < 40) black++;
  }
  const n = d.length / 4;
  return { w: c.width, h: c.height, corners: [at(0.03, 0.03), at(0.97, 0.03), at(0.97, 0.97), at(0.03, 0.97)], white: white / n, black: black / n, shadowPaper: at(0.92, 0.6) };
});
check("preview is the flattened page, portrait", stats.h > stats.w, `${stats.w} × ${stats.h}`);
check("no table left in the corners", stats.corners.every((v) => v > 200), stats.corners.join(", "));
check("shadowed paper turns white in black & white", stats.shadowPaper > 230, `${stats.shadowPaper}`);
check("text lines stay black", stats.black > 0.05 && stats.white > 0.5, `${(stats.black * 100).toFixed(0)}% black, ${(stats.white * 100).toFixed(0)}% white`);

// A 48-megapixel phone photo (6000 × 8000): opened shrunk, without a full-size decode, and still detected correctly.
{
  const big = await makePhoto(page, "big-48mp.jpg", 3, 2.5);
  const p = await context.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(BASE + "/tools/document-scanner", { waitUntil: "networkidle" });
  await p.locator('input[type="file"]').first().setInputFiles([big]);
  await p.getByRole("heading", { name: /Page 1: drag the corners/ }).waitFor({ timeout: 60_000 });
  const editSize = await p.locator("[data-corner-editor] img").evaluate(async (img) => {
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  });
  const bigHandles = await p.locator('[role="slider"][aria-label$="corner"]').evaluateAll((els) =>
    els.map((el) => {
      const m = el.getAttribute("aria-valuetext").match(/(\d+)% across, (\d+)% down/);
      return [Number(m[1]) / 100, Number(m[2]) / 100];
    }),
  );
  const bigWorst = Math.max(...bigHandles.map((h, i) => Math.hypot(h[0] - expected[i][0], h[1] - expected[i][1])));
  check("48 MP photo opens as a 900 × 1200 editing copy", editSize[0] === 900 && editSize[1] === 1200, editSize.join(" × "));
  check("48 MP photo: corners still found", bigWorst < 0.03, `worst ${(bigWorst * 100).toFixed(1)}%`);
  await p.close();
}

// Order and delete.
await page.getByRole("button", { name: "Move page 2 up" }).click();
check("pages can be reordered", (await page.getByRole("heading", { name: /^Page \d:/ }).innerText()).startsWith("Page 2"));

// PDF under 200 KB with both pages.
await page.locator("#prepare").getByText("200 KB", { exact: true }).click();
await page.getByRole("button", { name: /^Make PDF/ }).click();
await page.getByRole("heading", { name: "Your scanned PDF" }).waitFor({ timeout: 120_000 });
const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: /^Download PDF/ }).click()]);
const pdfPath = path.join(OUT, "scanned.pdf");
await download.saveAs(pdfPath);
const pdfBytes = fs.readFileSync(pdfPath);
const pdf = await PDFDocument.load(pdfBytes);
const size = pdf.getPage(0).getSize();
check("PDF: 2 pages, within 200 KB", pdf.getPageCount() === 2 && pdfBytes.length <= 200 * 1024, `${pdf.getPageCount()} pages, ${(pdfBytes.length / 1024).toFixed(0)} KB`);
check("PDF pages are A4 portrait", Math.abs(size.width - 595.28) < 1 && Math.abs(size.height - 841.89) < 1, `${size.width.toFixed(0)} × ${size.height.toFixed(0)} pt`);

await page.getByRole("button", { name: "Delete page 1" }).click();
check("a page can be deleted", (await page.getByRole("button", { name: /^Page \d$/ }).count()) === 1);

// Narrow and wide screens: nothing runs past the edge once pages are loaded.
for (const width of [320, 390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/tools/document-scanner", { waitUntil: "networkidle" });
  await p.locator('input[type="file"]').first().setInputFiles([photo1]);
  await p.getByRole("heading", { name: /Page 1: drag the corners/ }).waitFor({ timeout: 30_000 });
  const past = await p.evaluate(
    () =>
      [...document.querySelectorAll("#prepare *")].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 0.5).length +
      (document.documentElement.scrollWidth > window.innerWidth ? 1 : 0),
  );
  check(`${width}px: nothing runs past the screen edge`, past === 0, `${past} elements`);
  await ctx.close();
}

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
