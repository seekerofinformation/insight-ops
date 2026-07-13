#!/usr/bin/env node
// Playwright driver for InsightOps.
// Launches headless Chromium against an already-running dev server,
// walks every route, exercises one real interaction (AI Workbench SQL
// generation), and fails loudly if any page logs a console error.
//
// Usage:
//   node .claude/skills/run-insightops/driver.mjs [baseUrl]
// Default baseUrl: http://localhost:3000
//
// Screenshots land in /tmp/insightops-shots/.
// Exit code 0 = every route rendered and the interaction produced output
// with no console errors; non-zero = something broke (details on stderr).

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = "/tmp/insightops-shots";
mkdirSync(SHOTS, { recursive: true });

const ROUTES = [
  ["dashboard", "/dashboard", "Executive Dashboard"],
  ["catalog", "/catalog", "Dataset Catalog"],
  ["explorer", "/datasets/smart-city-traffic-events", "Dataset Explorer"],
  ["pipelines", "/pipelines", "Pipeline Builder"],
  ["ai-workbench", "/ai-workbench", "AI Workbench"],
  ["monitoring", "/monitoring", "Real-Time Monitoring"],
];

const errors = [];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

  // 1) Walk every route, screenshot each.
  for (const [name, path, marker] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.getByText(marker, { exact: false }).first().waitFor({ timeout: 30_000 });
    await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
    console.log(`✓ ${name.padEnd(14)} rendered "${marker}"`);
  }

  // 2) Real interaction: AI Workbench — fill prompt, generate SQL, read preview.
  await page.goto(BASE + "/ai-workbench", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Use example" }).click();
  await page.getByRole("button", { name: /Generate SQL/ }).click();
  await page.getByText("Result Preview").waitFor({ timeout: 30_000 });
  const previewRows = await page.locator("table tbody tr").count();
  await page.screenshot({ path: `${SHOTS}/ai-workbench-generated.png`, fullPage: true });
  if (previewRows < 1) throw new Error("AI Workbench generated no preview rows");
  console.log(`✓ ai-workbench  generated SQL + ${previewRows} preview rows`);

  // 3) Real interaction: Monitoring — pause the live stream, confirm it stops.
  await page.goto(BASE + "/monitoring", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Pause stream" }).click();
  await page.getByText("Stopped").waitFor({ timeout: 10_000 });
  console.log("✓ monitoring    stream pause toggles to Stopped");

  await browser.close();

  if (errors.length) {
    console.error(`\n✗ ${errors.length} console/page error(s):`);
    for (const e of errors) console.error("  " + e);
    process.exit(1);
  }
  console.log(`\nAll routes + interactions OK. Screenshots → ${SHOTS}/`);
}

main().catch((e) => {
  console.error("DRIVER FAILED:", e.message);
  process.exit(1);
});
