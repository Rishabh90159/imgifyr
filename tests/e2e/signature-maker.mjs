// End-to-end tests for the online signature maker in a real browser (Edge by default): drawing, typing, the PNG and
// JPG downloads, and handing the result to the signature resizer.
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/signature-maker.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const OUT = "tests/e2e/output/signature-maker";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
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

async function download(page, name) {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name }).click()]);
  const target = path.join(OUT, dl.suggestedFilename());
  await dl.saveAs(target);
  return { name: dl.suggestedFilename(), bytes: fs.readFileSync(target) };
}

/** Pixel facts measured in the browser: corner alpha and colour, and the share of dark ink pixels. */
async function inspect(page, bytes, mime) {
  return page.evaluate(
    async ({ b64, mime }) => {
      const bin = atob(b64);
      const raw = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
      const bitmap = await createImageBitmap(new Blob([raw], { type: mime }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      let ink = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128 && data[i] + data[i + 1] + data[i + 2] < 300) ink++;
      return { width: bitmap.width, height: bitmap.height, corner: Array.from(data.slice(0, 4)), inkShare: ink / (data.length / 4) };
    },
    { b64: bytes.toString("base64"), mime },
  );
}

// ---------- Draw ----------
{
  const page = await open("/tools/signature-maker");
  check("Create is disabled until something is drawn", await page.getByRole("button", { name: "Create signature" }).isDisabled());
  const pad = page.locator("canvas[aria-label^='Signature pad']");
  const box = await pad.boundingBox();
  // A loop and a long tail, like a quick signature.
  await page.mouse.move(box.x + 80, box.y + 150);
  await page.mouse.down();
  for (let t = 0; t <= 60; t++) await page.mouse.move(box.x + 80 + t * 7, box.y + 150 - Math.sin(t / 4) * 45, { steps: 2 });
  await page.mouse.up();
  await page.mouse.move(box.x + 120, box.y + 175);
  await page.mouse.down();
  await page.mouse.move(box.x + 480, box.y + 172, { steps: 15 });
  await page.mouse.up();
  await page.getByRole("button", { name: "Create signature" }).click();
  await page.getByRole("heading", { name: "Your signature", exact: true }).waitFor();

  const png = await download(page, "Download PNG (transparent)");
  const p = await inspect(page, png.bytes, "image/png");
  check("Drawn PNG: transparent background, ink present, trimmed and wide", png.name === "signature.png" && p.corner[3] === 0 && p.inkShare > 0.01 && p.width > p.height, `${p.width}×${p.height}, corner alpha ${p.corner[3]}, ink ${(p.inkShare * 100).toFixed(1)}%`);
  const jpg = await download(page, "Download JPG (white)");
  const j = await inspect(page, jpg.bytes, "image/jpeg");
  check("Drawn JPG: white background, same size", jpg.name === "signature.jpg" && j.corner[0] > 245 && j.corner[1] > 245 && j.corner[2] > 245 && j.width === p.width, `${j.width}×${j.height}, corner ${j.corner.slice(0, 3)}`);

  await page.getByRole("button", { name: "Undo" }).click();
  const cleared = await page
    .getByRole("heading", { name: "Your signature", exact: true })
    .waitFor({ state: "detached", timeout: 3000 })
    .then(() => true, () => false);
  check("Undo removes the last stroke and clears the old result", cleared);

  // Hand-off: the result opens in the signature resizer, ready to crop.
  await page.getByRole("button", { name: "Create signature" }).click();
  await page.getByRole("heading", { name: "Your signature", exact: true }).waitFor();
  await page.getByRole("button", { name: "Resize for an exam form →" }).click();
  await page.waitForURL("**/tools/signature-resizer");
  await page.locator('[aria-label*="crop area"]').first().waitFor({ timeout: 30_000 });
  check("Resize for an exam form: opens the signature resizer with the signature loaded", true);
  await page.close();
}

// ---------- Type ----------
{
  const page = await open("/tools/signature-maker");
  await page.getByText("Type", { exact: true }).click();
  check("Type mode warns to draw for exam forms", (await page.getByText("For exam and government forms, draw instead").count()) === 1);
  await page.getByRole("textbox", { name: "Your name" }).fill("Priya Sharma");
  check("Style options are announced by style name", (await page.getByRole("radio", { name: "Elegant", exact: true }).count()) === 1);
  await page.getByText("Elegant", { exact: true }).click();
  await page.getByText("Blue", { exact: true }).click();
  await page.getByRole("button", { name: "Create signature" }).click();
  await page.getByRole("heading", { name: "Your signature", exact: true }).waitFor();
  const fontLoaded = await page.evaluate(() => [...document.fonts].some((f) => /Great Vibes/i.test(f.family) && f.status === "loaded"));
  const png = await download(page, "Download PNG (transparent)");
  const p = await inspect(page, png.bytes, "image/png");
  check("Typed PNG: drawn in the handwriting font, transparent, wide", fontLoaded && p.corner[3] === 0 && p.width > p.height * 2, `${p.width}×${p.height}, font loaded: ${fontLoaded}`);
  await page.close();
}

// ---------- Phone ----------
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await phone.newPage();
  await page.goto(`${BASE}/tools/signature-maker`, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({
    wide: document.documentElement.scrollWidth > innerWidth,
    padBottom: document.querySelector("canvas[aria-label^='Signature pad']").getBoundingClientRect().bottom,
  }));
  check("Phone: no sideways scroll, signature pad on the first screen", !r.wide && r.padBottom < 844, `pad ends at ${Math.round(r.padBottom)} px`);
  await phone.close();
}

check("no requests to other origins (fonts are self-hosted) and no uploads", offending.length === 0, offending.slice(0, 5).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
