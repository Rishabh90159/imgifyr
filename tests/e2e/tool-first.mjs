// Exam and ID pages put the tool before the requirements card, so the upload box is on the first phone screen.
// Also checks that the whole upload box opens the file picker and the "Full requirements" link reaches the card.
// Runs in a real browser (Edge by default).
// Usage: start the production server (npm run build && npx next start -p 3100), then
//   node tests/e2e/tool-first.mjs
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const PAGES = ["afcat", "ctet", "cuet", "driving-licence", "dsssb", "ibps", "india-post-gds", "indian-bank", "jee-main", "kea", "neet", "rrb", "rrc-apprentice", "sbi", "ssc", "up-police", "upessc", "upsc", "upsssc", "voter-id", "passport", "mht-cet"].map((p) => `/tools/${p}-photo`);
const PHONE = { width: 390, height: 844 };

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
const context = await browser.newContext({ viewport: PHONE, isMobile: true, hasTouch: true });
const consoleErrors = [];

const tops = [];
const orderWrong = [];
for (const route of PAGES) {
  const page = await context.newPage();
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]');
    let box = input;
    while (box && box.getBoundingClientRect().height < 60) box = box.parentElement;
    const summary = document.querySelector('section[aria-labelledby="requirements-heading"]');
    return {
      top: Math.round(box.getBoundingClientRect().top + scrollY),
      // Node.DOCUMENT_POSITION_FOLLOWING (4): the summary comes after the upload box in the page.
      summaryAfter: Boolean(summary && box.compareDocumentPosition(summary) & 4),
    };
  });
  tops.push([route, r.top]);
  if (!r.summaryAfter) orderWrong.push(route);
  await page.close();
}
const worst = tops.sort((a, b) => b[1] - a[1])[0];
check(`upload box starts within the first phone screen on all ${PAGES.length} pages`, tops.every(([, t]) => t < PHONE.height), `lowest: ${worst[1]}px on ${worst[0]}`);
check("requirements card comes after the tool", orderWrong.length === 0, orderWrong.join(", "));

// Tapping the box (not the button) opens the picker; tapping the button opens it once.
{
  const page = await context.newPage();
  await page.goto(`${BASE}/tools/rrb-photo`, { waitUntil: "networkidle" });
  const box = page.locator('input[type="file"]').locator("xpath=ancestor::div[contains(@class,'border-dashed')][1]");
  const iconArea = await box.boundingBox();
  const [chooser] = await Promise.all([page.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null), page.mouse.click(iconArea.x + iconArea.width / 2, iconArea.y + 40)]);
  check("tapping the top of the upload box opens the file picker", Boolean(chooser));
  let opened = 0;
  page.on("filechooser", () => opened++);
  await page.getByText("Choose image", { exact: true }).click();
  await page.waitForTimeout(800);
  check("tapping the button opens the picker once", opened === 1, `opened ${opened} times`);
  await page.close();
}

// The link next to the exam picker reaches the full requirements.
{
  const page = await context.newPage();
  await page.goto(`${BASE}/tools/ssc-photo`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Full requirements" }).click();
  await page.waitForTimeout(600);
  const inView = await page.evaluate(() => {
    const h = document.getElementById("requirements-heading").getBoundingClientRect();
    return h.top >= 0 && h.top < innerHeight / 2;
  });
  check('"Full requirements" link brings the requirements card into view', inView);
  await page.close();
}

check("no page errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" || "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
