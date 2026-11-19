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

  await page.getByRole("button", { name: "Use it in the all-exam kit" }).click();
  await page.waitForURL(/\/tools\/all-exam-photo-signature$/);
  await page.locator('section[aria-label="1. Your photo"]').getByRole("button", { name: "Change" }).waitFor({ timeout: 30_000 });
  check("the practice photo opens in the all-exam kit", true);
  const tracks = await page.evaluate(() => document.querySelectorAll("video").length);
  check("the camera is released after leaving", tracks === 0);
}

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
