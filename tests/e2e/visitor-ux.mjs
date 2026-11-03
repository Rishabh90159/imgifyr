// A first-time visitor's paths, on a phone and a desktop (3 Nov 2026): the site search suggests tools as you type
// (names, everyday and Hinglish words, sizes), a PDF picked on an image tool points to the right tool, exam
// requirement tables stay readable on a phone, and a mistyped address gets "Did you mean…?".
// Usage: start the production server (npm run build && npx next start -p 3100), then node tests/e2e/visitor-ux.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CHANNEL = process.env.BROWSER_CHANNEL || "msedge";
const OUT = "tests/e2e/output/visitor-ux";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
const browser = await chromium.launch({ channel: CHANNEL, headless: true });
const consoleErrors = [];
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const desktop = { viewport: { width: 1440, height: 900 } };
async function open(options, route) {
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && consoleErrors.push(`${route}: ${m.text()}`));
  page.on("pageerror", (e) => consoleErrors.push(`${route}: ${e.message}`));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  return { ctx, page };
}
const optionNames = (page) => page.locator('[role="listbox"] [role="option"] span:first-child').allTextContents();

// ---------- Desktop header search ----------
{
  const { ctx, page } = await open(desktop, "/");
  const chunksBefore = [];
  page.on("request", (r) => r.url().endsWith(".js") && chunksBefore.push(r.url()));
  const box = page.getByRole("combobox", { name: "Search tools" }).first();
  await box.click();
  await page.locator('[role="listbox"]').first().waitFor();
  check("desktop search: focusing shows popular tools", (await optionNames(page)).length === 5 && /popular tools/i.test(await page.locator("header").innerText()));
  check("desktop search: the search data downloads only when the box is used", chunksBefore.length >= 1, `${chunksBefore.length} script(s) loaded on focus`);
  await box.fill("50kb");
  await page.waitForTimeout(150);
  let names = await optionNames(page);
  check("desktop search: '50kb' suggests the 50KB page first, as you type", names[0] === "50KB Photo Resizer", names.slice(0, 3).join(" | "));
  await box.fill("photo ka size kam kare");
  await page.waitForTimeout(150);
  names = await optionNames(page);
  check("desktop search: Hinglish 'photo ka size kam kare' finds the KB tool", names[0] === "Resize Image to Exact KB", names.slice(0, 3).join(" | "));
  await box.press("ArrowDown");
  check("desktop search: arrow keys move the highlight", (await page.locator('[role="option"][aria-selected="true"] span:first-child').first().innerText()) === names[1]);
  await box.press("ArrowUp");
  await box.press("Enter");
  await page.waitForURL("**/tools/resize-image-to-kb");
  check("desktop search: Enter opens the highlighted tool", page.url().endsWith("/tools/resize-image-to-kb"));
  const box2 = page.getByRole("combobox", { name: "Search tools" }).first();
  await box2.fill("30 kb");
  await page.waitForTimeout(150);
  await page.locator('[role="option"]').first().click();
  await page.waitForURL("**/tools/resize-image-to-kb?target=30");
  check("desktop search: '30 kb' opens the KB tool already set to 30 KB", page.url().endsWith("?target=30"));
  await box2.fill("pdf to jpg");
  await page.waitForTimeout(150);
  await box2.press("Escape");
  check("desktop search: Escape closes the suggestions and keeps the text", (await page.locator('header [role="listbox"]').count()) === 0 && (await box2.inputValue()) === "pdf to jpg");
  await page.screenshot({ path: path.join(OUT, "desktop-search.png") });
  await ctx.close();
}

// ---------- Phone search in the Tools menu ----------
{
  const { ctx, page } = await open(phone, "/tools/png-to-jpg");
  await page.locator("summary", { hasText: "Tools" }).filter({ visible: true }).click();
  const box = page.locator("[data-mobile-tools]").getByRole("combobox", { name: "Search tools" });
  await box.tap();
  await box.fill("signature ka size kam");
  await page.waitForTimeout(200);
  const names = await page.locator('[data-mobile-tools] [role="option"] span:first-child').allTextContents();
  check("phone search: suggestions appear inside the Tools menu", names[0] === "Signature Resizer", names.slice(0, 3).join(" | "));
  await page.screenshot({ path: path.join(OUT, "phone-search.png") });
  await page.locator('[data-mobile-tools] [role="option"]').first().tap();
  await page.waitForURL("**/tools/signature-resizer");
  check("phone search: tapping a suggestion opens it and closes the menu", (await page.locator("details[data-disclosure-menu][open]").count()) === 0);
  await ctx.close();
}

// ---------- All tools page search, and a search with no single match ----------
{
  const { ctx, page } = await open(phone, "/tools");
  const box = page.getByRole("combobox", { name: "Find a tool" });
  check("tools page: a large search box sits above the 59 tools", await box.isVisible());
  await box.tap();
  await box.fill("round profile picture");
  await page.waitForTimeout(200);
  const names = await optionNames(page);
  check("tools page: everyday words find the right tool ('round profile picture' → Circle crop)", names[0] === "Circle Crop Image", names.slice(0, 3).join(" | "));
  await box.fill("qwertyzz");
  await page.waitForTimeout(200);
  check("tools page: no match says so and offers all tools", (await page.getByText(/Nothing matches/).count()) === 1);
  await page.goto(BASE + "/tools?q=passport", { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Find a tool" }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length > 0);
  check("tools page: ?q= from another page's search is shown", (await page.getByRole("combobox", { name: "Find a tool" }).inputValue()) === "passport");
  await ctx.close();
}

// ---------- A PDF on an image tool ----------
for (const [label, options] of [["phone", phone], ["desktop", desktop]]) {
  const { ctx, page } = await open(options, "/tools/50kb-photo");
  await page.locator('input[type="file"]').first().setInputFiles({ name: "marksheet.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n") });
  const alert = page.getByRole("alert").filter({ hasText: "couldn't use" });
  await alert.waitFor();
  const text = await alert.innerText();
  check(`${label}: a PDF on an image tool says it's a PDF and links the right tools`, /This is a PDF/.test(text) && (await alert.getByRole("link", { name: "Convert the PDF to JPG" }).count()) === 1, text.replace(/\s+/g, " ").slice(0, 120));
  await page.locator('input[type="file"]').first().setInputFiles({ name: "resume.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: Buffer.from("PK\x03\x04 word document") });
  await page.waitForTimeout(500);
  check(`${label}: a Word file gets a Word to PDF link`, (await page.getByRole("alert").getByRole("link", { name: "Convert Word to PDF" }).count()) === 1);
  await ctx.close();
}

// ---------- Exam requirements table on a phone ----------
{
  const { ctx, page } = await open(phone, "/tools/ibps-photo");
  const scroller = page.locator(".scroll-shadow-x").first();
  const info = await scroller.evaluate((el) => ({ scrollable: el.scrollWidth > el.clientWidth + 2, wraps: [...el.querySelectorAll("td")].some((td) => td.getBoundingClientRect().height > 40) }));
  check("exam table: values stay on one line and the table scrolls sideways", info.scrollable && !info.wraps);
  const before = await page.locator('tbody th[scope="row"]').first().boundingBox();
  await scroller.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
  await page.waitForTimeout(200);
  const after = await page.locator('tbody th[scope="row"]').first().boundingBox();
  check("exam table: the label column stays in place while scrolling", Math.abs(before.x - after.x) < 1, `x ${before.x} → ${after.x}`);
  await scroller.evaluate((el) => el.scrollTo({ left: 0 }));
  await scroller.screenshot({ path: path.join(OUT, "phone-ibps-table.png") });
  await ctx.close();
}

// ---------- 404 ----------
{
  const { ctx, page } = await open(phone, "/tools/50-kb-photo");
  const hint = page.getByText("Did you mean");
  await hint.waitFor({ timeout: 10_000 });
  check("404: a near-miss address suggests the right page", (await page.getByRole("link", { name: "50KB Photo Resizer" }).first().getAttribute("href")) === "/tools/50kb-photo");
  check("404: the page has a search box", await page.getByRole("combobox", { name: "Find a tool" }).isVisible());
  await page.screenshot({ path: path.join(OUT, "phone-404.png") });
  await ctx.close();
}

check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
