// Phone experience of the KB and exam pages (3 Nov 2026): results come into view with the download button on
// screen, fixed-size pages start without a tap and fold their settings, several photos make a batch, and exam
// pages start by themselves only when there's nothing to frame.
// Usage: start the production server (npm run build && npx next start -p 3100), then node tests/e2e/ux-flow.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const OUT = "tests/e2e/output/ux-flow";
const KB = 1024;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
if (!fs.existsSync(path.join(FIX, "portrait.jpg"))) {
  await generateFixtures(browser, FIX);
  await generatePhase2Fixtures(browser, FIX);
}
const consoleErrors = [];
const offending = [];
const origin = new URL(BASE).origin;

async function phone() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, acceptDownloads: true });
  ctx.on("request", (req) => {
    if (/^https?:/.test(req.url()) && (new URL(req.url()).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${req.url()}`);
  });
  return ctx;
}
async function open(ctx, route) {
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${route}: ${m.text()}`));
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return page;
}
async function download(page, locator) {
  const [file] = await Promise.all([page.waitForEvent("download"), locator.click()]);
  const target = path.join(OUT, file.suggestedFilename());
  await file.saveAs(target);
  return { name: file.suggestedFilename(), bytes: fs.readFileSync(target) };
}
/** Where an element is on screen once scrolling has settled. */
async function onScreen(page, locator) {
  await page.waitForTimeout(900);
  return locator.evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), visible: b.top >= 0 && b.bottom <= innerHeight, viewport: innerHeight };
  });
}

// A photo already in the IBPS photo shape (200 × 230), made in the browser.
const ibpsShaped = path.join(OUT, "ibps-shaped.jpg");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const b64 = await page.evaluate(async () => {
    const c = new OffscreenCanvas(600, 690);
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 600, 690);
    grad.addColorStop(0, "#8ab");
    grad.addColorStop(1, "#dcb");
    g.fillStyle = grad;
    g.fillRect(0, 0, 600, 690);
    g.fillStyle = "#654";
    g.beginPath();
    g.ellipse(300, 300, 130, 170, 0, 0, Math.PI * 2);
    g.fill();
    const blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.95 });
    return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer())));
  });
  fs.writeFileSync(ibpsShaped, Buffer.from(b64, "base64"));
  await ctx.close();
}

// ---------- 1 + 2 + 3: the 50 KB page on a phone ----------
{
  const ctx = await phone();
  const page = await open(ctx, "/tools/50kb-photo");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo-12mp.jpg"));
  const heading = page.locator("#result-heading");
  await heading.waitFor({ timeout: 60_000 });
  check("quick start: the result appears without tapping a button", (await page.getByRole("button", { name: /^Resize to/ }).count()) === 0);
  const h = await onScreen(page, heading);
  check("reveal: result heading lands in the top part of the phone screen", h.top >= 60 && h.top < h.viewport * 0.4, `heading top ${h.top}px of ${h.viewport}`);
  const dlButton = page.getByRole("link", { name: /^Download JPG/ });
  const d = await onScreen(page, dlButton);
  check("reveal: the Download button is on screen without scrolling", d.visible, `button ${d.top}–${d.bottom}px`);
  const file = await download(page, dlButton);
  check("quick start: the file is a JPG of 50 KB or less", file.bytes[0] === 0xff && file.bytes.length <= 50 * KB, `${(file.bytes.length / KB).toFixed(1)} KB`);
  await page.screenshot({ path: path.join(OUT, "50kb-phone-result.png") });

  const summary = page.locator("summary", { hasText: "Change settings" });
  check("folded settings: one summary line names the target and format", /50(.0)? KB or less · JPG/.test(await summary.innerText()), (await summary.innerText()).replace(/\s+/g, " "));
  check("folded settings: detailed options hidden until asked for", !(await page.locator('label:text-is("Allow smaller dimensions")').isVisible()));
  await summary.click();
  check("folded settings: Change settings opens them", await page.locator('label:text-is("Allow smaller dimensions")').isVisible());
  await page.getByText("30 KB", { exact: true }).click();
  const again = page.getByRole("button", { name: "Resize to 30.0 KB" });
  check("folded settings: after a change, the button comes back for the new target", await again.isVisible());
  await again.click();
  await page.getByText(/within your 30\.0 KB target/).waitFor({ timeout: 60_000 });
  const file30 = await download(page, page.getByRole("link", { name: /^Download JPG/ }));
  check("folded settings: the new target is used", file30.bytes.length <= 30 * KB, `${(file30.bytes.length / KB).toFixed(1)} KB`);
  await page.close();
  await ctx.close();
}

// ---------- The generic KB page keeps its full settings and button ----------
{
  const ctx = await phone();
  const page = await open(ctx, "/tools/resize-image-to-kb");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo-12mp.jpg"));
  const button = page.getByRole("button", { name: /^Resize to/ });
  await button.waitFor({ timeout: 30_000 });
  check("generic page: settings open and the button waits for a tap", (await page.locator('label:text-is("Allow smaller dimensions")').isVisible()) && (await page.locator("#result-heading").count()) === 0);
  await button.click();
  const heading = page.locator("#result-heading");
  await heading.waitFor({ timeout: 60_000 });
  const d = await onScreen(page, page.getByRole("link", { name: /^Download/ }));
  check("generic page: after the tap the Download button is on screen", d.visible, `button ${d.top}–${d.bottom}px`);
  await page.close();
  await ctx.close();
}

// ---------- 4: several photos at once ----------
{
  const ctx = await phone();
  const page = await open(ctx, "/tools/50kb-photo");
  check("batch: the upload box says several photos can be chosen", /up to 10 at a time/.test(await page.locator("main").innerText()));
  await page.locator('input[type="file"]').first().setInputFiles([path.join(FIX, "photo-12mp.jpg"), path.join(FIX, "photo.png"), path.join(FIX, "portrait.jpg")]);
  const heading = page.locator("#batch-heading");
  await page.getByText("3 of 3 photos ready").waitFor({ timeout: 120_000 });
  check("batch: all three photos processed without a tap", (await heading.innerText()).startsWith("3 of 3 photos ready"));
  const badges = await page.getByText("within target", { exact: true }).count();
  check("batch: each photo is within 50 KB", badges === 3, `${badges} within target`);
  const h = await onScreen(page, heading);
  check("batch: the finished list comes into view", h.top >= 60 && h.top < h.viewport * 0.5, `heading top ${h.top}px`);
  const one = await download(page, page.getByRole("link", { name: "Download" }).first());
  check("batch: a single photo downloads on its own", one.bytes.length <= 50 * KB, `${one.name}, ${(one.bytes.length / KB).toFixed(1)} KB`);
  const zip = await download(page, page.getByRole("button", { name: /Download all \(3\) as ZIP/ }));
  const entries = zip.bytes.toString("latin1").match(/PK\x03\x04/g)?.length ?? 0;
  check("batch: the ZIP holds all three photos", zip.name === "photos-50kb.zip" && entries === 3, `${zip.name}, ${entries} files, ${(zip.bytes.length / KB).toFixed(0)} KB`);
  await page.screenshot({ path: path.join(OUT, "50kb-phone-batch.png"), fullPage: true });

  await page.locator("summary", { hasText: "Change settings" }).click();
  await page.getByText("30 KB", { exact: true }).click();
  await page.waitForFunction(() => document.querySelector("#batch-heading")?.textContent?.startsWith("3 of 3 photos ready") && document.body.innerText.includes("30.0 KB or less"), null, { timeout: 120_000 });
  const zip30 = await download(page, page.getByRole("button", { name: /Download all \(3\) as ZIP/ }));
  check("batch: changing the target remakes every photo", zip30.name === "photos-30kb.zip", zip30.name);

  await page.getByRole("button", { name: "Remove photo.png" }).click();
  check("batch: a photo can be removed", (await heading.innerText()).startsWith("2 of 2"));
  await page.getByRole("button", { name: "Start over" }).click();
  check("batch: Start over returns to the upload box", await page.getByRole("button", { name: /Choose image/ }).or(page.getByText("Choose images")).first().isVisible());
  await page.close();
  await ctx.close();
}
{
  const ctx = await phone();
  const page = await open(ctx, "/tools/100kb-photo");
  const twelve = Array.from({ length: 12 }, (_, i) => path.join(FIX, `batch-${String(i).padStart(2, "0")}.${i % 5 === 0 ? "jpeg" : i % 5 === 3 ? "webp" : "png"}`)).filter((f) => fs.existsSync(f));
  await page.locator('input[type="file"]').first().setInputFiles(twelve);
  await page.locator("#batch-heading").waitFor({ timeout: 60_000 });
  const notice = await page.getByText(/limit is 10 images/).count();
  check("batch: more than 10 photos are capped at 10 with a notice", notice === 1 && /of 10 photos/.test(await page.locator("#batch-heading").innerText()), `${twelve.length} chosen`);
  await page.close();
  await ctx.close();
}

// ---------- Exam pages: start by themselves only when nothing needs framing ----------
{
  const ctx = await phone();
  const page = await open(ctx, "/tools/ibps-photo");
  await page.locator('input[type="file"]').first().setInputFiles(ibpsShaped);
  await page.locator("#result-heading").waitFor({ timeout: 60_000 });
  const d = await onScreen(page, page.getByRole("link", { name: /^Download JPG/ }));
  check("exam: a photo already in the IBPS shape is made without a tap", d.visible, `button ${d.top}–${d.bottom}px`);
  const file = await download(page, page.getByRole("link", { name: /^Download JPG/ }));
  check("exam: the auto-made file is the IBPS JPG", file.bytes[0] === 0xff && file.bytes.length <= 50 * KB, `${(file.bytes.length / KB).toFixed(1)} KB`);

  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo-12mp.jpg"));
  await page.waitForTimeout(3000);
  check("exam: a photo of another shape waits for the person to frame it", (await page.locator("#result-heading").count()) === 0 && (await page.getByRole("button", { name: "Create photo file" }).isVisible()));
  await page.close();
  await ctx.close();
}

// ---------- Desktop: a visible result doesn't jolt the page ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/tools/png-to-jpg", { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "photo.png"));
  await page.locator("#result-heading").waitFor({ timeout: 60_000 });
  const h = await onScreen(page, page.locator("#result-heading"));
  check("desktop: result heading is in view after converting", h.top >= 60 && h.bottom <= h.viewport, `heading top ${h.top}px of ${h.viewport}`);
  await page.close();
  await ctx.close();
}

check("no image left the device (only same-origin GETs)", offending.length === 0, offending.slice(0, 3).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
