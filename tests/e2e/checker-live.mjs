// End-to-end tests for the exam photo checker and live photo practice in a real browser (Edge by default).
// Live practice runs against the browser's fake camera (a moving test pattern).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/checker-live.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({
  channel: CHANNEL,
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
if (!fs.existsSync(path.join(FIX, "portrait.jpg"))) {
  await generateFixtures(browser, FIX);
  await generatePhase2Fixtures(browser, FIX);
}
const origin = new URL(BASE).origin;
const offending = [];
const errors = [];
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 }, permissions: ["camera"] });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});
async function open(p) {
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  return page;
}
const results_ = (page) => page.getByRole("list", { name: "Check results" }).locator("li").allInnerTexts();

// ---------------------------------------------------------------- Checker
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const p = await phone.newPage();
  await p.goto(BASE + "/tools/exam-photo-checker", { waitUntil: "networkidle" });
  const box = await p.getByRole("button", { name: /choose/i }).first().boundingBox();
  check("checker, phone: upload button on the first screen", box && box.y + box.height < 844, box ? `bottom at ${Math.round(box.y + box.height)} px` : "not found");
  await phone.close();
}

{
  const page = await open("/tools/exam-photo-checker");
  await page.getByLabel("Check against").selectOption({ label: "PAN card" });
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "portrait.jpg"));
  await page.getByRole("heading", { name: /problem|Looks OK|No problems/ }).waitFor({ timeout: 30_000 });
  const rows = await results_(page);
  const pixels = rows.find((r) => r.startsWith("✗") && r.includes("Pixel size")) ?? "";
  check("PAN: a 1200 × 1600 photo fails the 197 × 276 pixel rule", pixels.includes("197 × 276"), pixels.split("\n")[0]);
  check("PAN: the heading counts the problems", /problems? to fix/.test(await page.locator("#check-results").innerText()));
  check("photo checks include light, background and sharpness", ["Light", "Background", "Sharpness"].every((l) => rows.some((r) => r.includes(l))));

  // Switching the form re-checks the same file.
  await page.getByLabel("Check against").selectOption({ label: "Any form (general checks)" });
  const general = await results_(page);
  check("general check: no pixel or KB failures without a form", !general.some((r) => r.startsWith("✗")), general.map((r) => r.split("\n")[0].slice(0, 2)).join(""));

  // Fix it hands the photo to the PAN page.
  await page.getByLabel("Check against").selectOption({ label: "PAN card" });
  await page.getByRole("listitem").filter({ hasText: "Pixel size" }).getByRole("button", { name: "Fix it" }).click();
  await page.waitForURL(/\/tools\/pan-card-photo$/);
  await page.getByLabel("Photo crop area").first().waitFor({ timeout: 30_000 });
  check("Fix it opens the PAN page with the photo loaded", true);
}

{
  // A PNG renamed to .jpg: portals read the bytes, and so does the checker.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "checker-"));
  const renamed = path.join(dir, "renamed.jpg");
  fs.copyFileSync(path.join(FIX, "logo.png"), renamed);
  const page = await open("/tools/exam-photo-checker");
  await page.locator('input[type="file"]').first().setInputFiles(renamed);
  await page.getByRole("heading", { name: /problem|Looks OK|No problems/ }).waitFor({ timeout: 30_000 });
  const type = (await results_(page)).find((r) => r.includes("File type")) ?? "";
  check("a renamed PNG is caught", type.startsWith("✗") && /really a PNG/.test(type), type.split("\n")[0]);
  await page.getByRole("listitem").filter({ hasText: "File type" }).getByRole("button", { name: "Fix it" }).click();
  await page.waitForURL(/\/tools\/image-to-jpg$/);
  check("its Fix it opens the JPG converter", true);
  fs.rmSync(dir, { recursive: true, force: true });
}

{
  const page = await open("/tools/exam-photo-checker");
  await page.getByText("Signature", { exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIX, "signature.jpg"));
  await page.getByRole("heading", { name: /problem|Looks OK|No problems/ }).waitFor({ timeout: 30_000 });
  const rows = await results_(page);
  check("signature checks look at the ink and the paper", rows.some((r) => /Size in the image|Signature/.test(r)) && rows.some((r) => r.includes("Paper")), rows.length + " rows");
}

// ---------------------------------------------------------------- Live photo practice
{
  const res = await fetch(BASE + "/tools/live-photo-practice");
  check("the page allows the camera for this site only", /camera=\(self\)/.test(res.headers.get("permissions-policy") ?? ""), res.headers.get("permissions-policy") ?? "no header");
  const other = await fetch(BASE + "/tools/ssc-photo");
  check("microphone and location stay blocked", /microphone=\(\)/.test(other.headers.get("permissions-policy") ?? "") && /geolocation=\(\)/.test(other.headers.get("permissions-policy") ?? ""));

  const page = await open("/tools/live-photo-practice");
  check("SSC live rules are shown before the camera starts", (await page.locator("#live-rules ~ ul, section[aria-labelledby='live-rules'] ul").first().innerText()).includes("plain background"));
  await page.getByRole("button", { name: "Start camera" }).click();
  const live = page.getByRole("list", { name: "Live check results" }).locator("li");
  await live.first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(800);
  const rows = await live.allInnerTexts();
  check("the camera starts and live checks run", ["Light", "Even light", "Background", "Sharpness"].every((l) => rows.some((r) => r.includes(l))), `${rows.length} rows`);
  check("the face box is drawn over the preview", (await page.locator("video + div[aria-hidden='true']").count()) === 1);

  await page.getByRole("button", { name: "Take practice photo" }).click();
  await page.getByRole("heading", { name: "Your practice photo" }).waitFor({ timeout: 15_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download" }).click()]);
  const bytes = fs.readFileSync(await download.path());
  check("the practice photo downloads as a JPG", download.suggestedFilename() === "practice-photo.jpg" && bytes[0] === 0xff && bytes[1] === 0xd8, `${bytes.length} bytes`);

  // Short notice names in the dropdown (an open list is as wide as its longest option); the full name sits below.
  // Exam buttons, then that exam's notices as choices (no dropdown list that can run off a narrow screen).
  await page.getByText("RRB", { exact: true }).click();
  const rrb = page.getByRole("group", { name: "RRB notice" }).getByRole("radio");
  check("live: picking RRB lists its notices as choices", (await rrb.count()) === 4);
  await page.getByText("AFCAT", { exact: true }).click();
  const rules = await page.locator("section[aria-labelledby='live-rules']").innerText();
  check("live: AFCAT shows its full notice name and its rule", rules.includes("NCC Special Entry") && rules.includes("live image"));

  await page.getByRole("button", { name: "Use it in the all-exam kit" }).click();
  await page.waitForURL(/\/tools\/all-exam-photo-signature$/);
  await page.locator('section[aria-label="1. Your photo"]').getByRole("button", { name: "Change" }).waitFor({ timeout: 30_000 });
  check("the practice photo opens in the all-exam kit", true);
  const tracks = await page.evaluate(() => document.querySelectorAll("video").length);
  check("the camera is released after leaving", tracks === 0);
}

// Narrow screens: nothing on the live page runs past the edge, with the longest notice list shown.
for (const width of [320, 360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/tools/live-photo-practice", { waitUntil: "networkidle" });
  await p.getByText("SSC", { exact: true }).click();
  const past = await p.evaluate(() =>
    [...document.querySelectorAll("#prepare *")].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 0.5).length +
    (document.documentElement.scrollWidth > window.innerWidth ? 1 : 0),
  );
  check(`live, ${width}px: nothing runs past the screen edge`, past === 0, `${past} elements`);
  await ctx.close();
}

// A camera with a striped (busy) background: "Take practice photo" warns first, and the photo then scrolls into view.
{
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 480;
      const ctx = c.getContext("2d");
      const draw = () => {
        for (let x = 0; x < 640; x += 16) {
          ctx.fillStyle = (x / 16) % 2 ? "#f5f5f5" : "#202020";
          ctx.fillRect(x, 0, 16, 480);
        }
        ctx.fillStyle = "#c08060";
        ctx.beginPath();
        ctx.ellipse(320, 200, 90, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        requestAnimationFrame(draw);
      };
      draw();
      return c.captureStream(15);
    };
  });
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto(BASE + "/tools/live-photo-practice", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start camera" }).click();
  await page.getByRole("list", { name: "Live check results" }).getByText("The background is busy").waitFor({ timeout: 30_000 });
  await page.getByRole("button", { name: "Take practice photo" }).click();
  const warning = page.getByRole("status").filter({ hasText: "Not quite ready yet" });
  await warning.waitFor({ timeout: 5_000 });
  check("live: a failing check warns before the photo is taken", (await warning.innerText()).includes("background is busy") && (await page.getByRole("heading", { name: "Your practice photo" }).count()) === 0);
  await page.getByRole("button", { name: "Keep adjusting" }).click();
  check("live: Keep adjusting closes the warning without a photo", (await warning.count()) === 0 && (await page.getByRole("heading", { name: "Your practice photo" }).count()) === 0);
  await page.getByRole("button", { name: "Take practice photo" }).click();
  await page.getByRole("button", { name: "Take it anyway" }).click();
  const heading = page.getByRole("heading", { name: "Your practice photo" });
  await heading.waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1200);
  const top = await heading.evaluate((h) => h.getBoundingClientRect().top);
  check("live: the photo scrolls into view below the camera", top >= 0 && top < 700, `heading at ${Math.round(top)} px`);
  check("live: focus moves to the photo", await heading.evaluate((h) => document.activeElement === h));
  await page.close();
}

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
