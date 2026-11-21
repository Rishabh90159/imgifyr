// End-to-end tests for the YouTube thumbnail maker in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/youtube-thumbnail.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/youtube-thumbnail";
const LIMIT = 2 * 1024 * 1024;
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
const errors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});

/** A detailed, noisy 4000 × 3000 photo: the hardest case for staying under 2 MB at 3840 × 2160. */
async function noisyPhoto(page) {
  const b64 = await page.evaluate(async () => {
    const c = new OffscreenCanvas(4000, 3000);
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(4000, 3000);
    let s = 7;
    for (let i = 0; i < img.data.length; i += 4) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      img.data[i] = s & 255;
      img.data[i + 1] = (s >> 8) & 255;
      img.data[i + 2] = (s >> 16) & 255;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.95 });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let t = "";
    for (let i = 0; i < bytes.length; i++) t += String.fromCharCode(bytes[i]);
    return btoa(t);
  });
  const target = path.join(OUT, "noisy.jpg");
  fs.writeFileSync(target, Buffer.from(b64, "base64"));
  return target;
}

async function make(page, file, { kind, layout }) {
  await page.locator('input[type="file"]').first().setInputFiles(file);
  await page.getByRole("button", { name: /Create thumbnail|Create again/ }).waitFor({ timeout: 30_000 });
  if (kind) await page.locator("#prepare, main").getByText(kind, { exact: true }).first().click();
  if (layout) await page.locator("#prepare, main").getByText(layout, { exact: true }).first().click();
  await page.getByRole("button", { name: /Create thumbnail|Create again/ }).click();
  const result = page.locator('section[aria-labelledby="result-heading"]');
  await result.waitFor({ timeout: 120_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), result.getByRole("link", { name: /^Download thumbnail/ }).click()]);
  const bytes = fs.readFileSync(await download.path());
  const dims = await page.evaluate(async (b64) => {
    const bin = atob(b64);
    const raw = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
    const bm = await createImageBitmap(new Blob([raw], { type: "image/jpeg" }));
    return { w: bm.width, h: bm.height };
  }, bytes.toString("base64"));
  return { bytes, ...dims };
}

const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE + "/tools/youtube-thumbnail", { waitUntil: "networkidle" });
const noisy = await noisyPhoto(page);

const video = await make(page, path.join(FIX, "portrait.jpg"), {});
check("portrait photo → 3840 × 2160 JPG under 2 MB (fit, default)", video.w === 3840 && video.h === 2160 && video.bytes[0] === 0xff && video.bytes.length <= LIMIT, `${video.w} × ${video.h}, ${(video.bytes.length / 1024).toFixed(0)} KB`);

await page.goto(BASE + "/tools/youtube-thumbnail", { waitUntil: "networkidle" });
const hard = await make(page, noisy, { layout: "Fill the frame" });
check("very detailed 12 MP photo still fits under 2 MB at 3840 × 2160", hard.w === 3840 && hard.h === 2160 && hard.bytes.length <= LIMIT, `${(hard.bytes.length / 1024).toFixed(0)} KB`);

await page.goto(BASE + "/tools/youtube-thumbnail", { waitUntil: "networkidle" });
const shorts = await make(page, path.join(FIX, "portrait.jpg"), { kind: "Shorts (9:16)" });
check("Shorts → 2160 × 3840 under 2 MB", shorts.w === 2160 && shorts.h === 3840 && shorts.bytes.length <= LIMIT, `${shorts.w} × ${shorts.h}, ${(shorts.bytes.length / 1024).toFixed(0)} KB`);

const text = await page.locator("main").innerText();
check("page states YouTube's official limits (2 MB phone, 50 MB computer, verified account)", /2 MB/.test(text) && /50 MB/.test(text) && /verified/i.test(text));

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
