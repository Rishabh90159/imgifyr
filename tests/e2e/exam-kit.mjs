// End-to-end tests for the all-exam photo and signature kit in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/exam-kit.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { generateFixtures, generatePhase2Fixtures } from "./fixtures.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const FIX = "tests/fixtures/generated";
const PATH = "/tools/all-exam-photo-signature";

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

// Phone: the first upload box is on the first screen.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.goto(BASE + PATH, { waitUntil: "networkidle" });
  const box = await page.getByRole("button", { name: /choose/i }).first().boundingBox();
  check("phone: the photo upload button is on the first screen", box && box.y + box.height < 844, box ? `bottom at ${Math.round(box.y + box.height)} px` : "not found");
  await context.close();
}

const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
context.on("request", (req) => {
  const url = req.url();
  if (/^https?:/.test(url) && (new URL(url).origin !== origin || req.method() !== "GET")) offending.push(`${req.method()} ${url}`);
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(BASE + PATH, { waitUntil: "networkidle" });

check("button waits for files and forms", await page.getByRole("button", { name: /^Make all files/ }).isDisabled());

await page.locator('section[aria-label="1. Your photo"] input[type="file"]').setInputFiles(path.join(FIX, "portrait.jpg"));
await page.locator('section[aria-label="1. Your photo"]').getByRole("button", { name: "Change" }).waitFor({ timeout: 30_000 });
await page.locator('section[aria-label="2. Your signature"] input[type="file"]').setInputFiles(path.join(FIX, "signature.jpg"));
await page.locator('section[aria-label="2. Your signature"]').getByRole("button", { name: "Change" }).waitFor({ timeout: 30_000 });
check("both images load into their own croppers", true);

for (const name of ["SSC", "PAN card", "MHT CET", "AFCAT", "IBPS"]) await page.getByLabel(name, { exact: true }).check();
check("SSC offers its notices to choose from", await page.getByLabel("SSC notice").isVisible());

await page.getByRole("button", { name: /^Make all files/ }).click();
await page.getByRole("heading", { name: /^Your files/ }).waitFor({ timeout: 120_000 });
const rows = page.locator('section[aria-labelledby="kit-results"] ul').first().locator("li");
const count = await rows.count();
const texts = await rows.allInnerTexts();
check("files are made for the ticked forms", count >= 7, `${count} files`);

const row = (prefix) => texts.find((t) => t.replace(/^[✓!]\s*/, "").startsWith(prefix)) ?? "";
const kb = (t) => {
  const m = t.match(/·\s*([\d.]+)\s*(KB|MB)/);
  return m ? Number(m[1]) * (m[2] === "MB" ? 1024 : 1) : NaN;
};
const pan = row("PAN card photo");
check("PAN photo: 197 × 276 px, at most 20 KB, passes", pan.includes("197 × 276") && kb(pan) <= 20 && pan.startsWith("✓"), pan.split("\n").slice(0, 2).join(" | "));
const panSig = row("PAN card signature");
check("PAN signature: 354 × 157 px, at most 10 KB", panSig.includes("354 × 157") && kb(panSig) <= 10, panSig.split("\n").slice(0, 2).join(" | "));
const mht = row("MHT CET photo");
const mhtDims = mht.match(/(\d+) × (\d+) px/);
check("MHT CET photo is square and at least 100 KB", mhtDims && mhtDims[1] === mhtDims[2] && kb(mht) >= 100, mht.split("\n").slice(0, 2).join(" | "));
check("MHT CET photo carries the 80% face note", mht.includes("80%"));
check("AFCAT keeps its required file name note", row("AFCAT signature").includes("Signature.jpg"));
const notes = await page.locator('section[aria-labelledby="kit-results"]').innerText();
check("AFCAT is flagged for its thumb impression", /AFCAT:[^\n]*thumb impression/i.test(notes));
check("every row passes or explains itself", texts.every((t) => t.startsWith("✓") || /minimum|under|80%/.test(t)));

// One ZIP with every file.
const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download all (ZIP)" }).click()]);
const zip = fs.readFileSync(await download.path());
let entries = 0;
for (let i = 0; i + 4 <= zip.length; i++) if (zip[i] === 0x50 && zip[i + 1] === 0x4b && zip[i + 2] === 0x01 && zip[i + 3] === 0x02) entries++;
check("ZIP holds one file per row", download.suggestedFilename() === "exam-photos-and-signatures.zip" && entries === count, `${entries} entries`);

// Settings changed: old results are hidden until made again.
await page.getByLabel("IBPS", { exact: true }).uncheck();
check("changing the forms hides stale results", (await page.getByRole("heading", { name: /^Your files/ }).count()) === 0);

// Fine-tune hands the photo to the exam page.
await page.getByRole("button", { name: /^Make all files/ }).click();
await page.getByRole("heading", { name: /^Your files/ }).waitFor({ timeout: 120_000 });
await page.getByRole("button", { name: "Fine-tune on the PAN card page" }).first().click();
await page.waitForURL(/\/tools\/pan-card-photo$/);
await page.getByLabel("Photo crop area").first().waitFor({ timeout: 30_000 });
check("fine-tune opens the PAN page with the photo already loaded", true);

check("no uploads or third-party requests", offending.length === 0, offending.slice(0, 3).join(", "));
check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
