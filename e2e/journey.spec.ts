import { test, expect } from "@playwright/test";
import { loginAs, watchConsole } from "./helpers";

test.describe.configure({ mode: "serial" });

test("end-to-end: log in → invest → tx appears in /chain and /supervisor → dashboard shows the holding", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "journey runs once, on desktop");
  const errors = watchConsole(page);
  await loginAs(page, "admin");

  // Choose the Cork loan and run the six steps.
  await page.goto("/invest");
  await expect(page.getByRole("heading", { name: "Choose an offer" })).toBeVisible();
  await page.getByRole("link", { name: /Simulate a loan/ }).first().click();
  await expect(page).toHaveURL(/\/invest\/prop-cork/);
  await page.getByLabel("Amount (€)").fill("2500");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Run simulated ID check" }).click();
  await expect(page.getByText("Simulated — passed").first()).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Run simulated AML screen" }).click();
  await expect(page.getByText("Simulated — passed").nth(1)).toBeVisible({ timeout: 5000 });
  // Knowledge test: the second option is correct for every question.
  for (let q = 0; q < 5; q++) await page.locator(`input[name="q${q}"]`).nth(1).check();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.getByText(/Passed — 5\/5/)).toBeVisible();
  await page.getByLabel(/I understand that I could lose/).check();
  await page.getByRole("button", { name: "Continue" }).click();

  // Risk acknowledgement, including the €1,000 / 5% warning (2,500 > 5% of 45,000).
  await expect(page.getByText("Property investments involve risk, including possible loss of capital. Returns are not guaranteed and investments may be illiquid.").first()).toBeVisible();
  await page.getByLabel(/I have read and understood/).check();
  await page.getByLabel(/expressly consent to proceed/).check();
  await page.getByRole("button", { name: "Continue to review" }).click();

  await expect(page.getByRole("heading", { name: "Review your simulation" })).toBeVisible();
  await expect(page.getByText("Key Investment Information Sheet").first()).toBeVisible();
  await page.getByRole("button", { name: "Complete simulation" }).click();

  await expect(page.getByRole("heading", { name: "Simulation Completed" })).toBeVisible();
  await expect(page.getByText("No real money has been transferred.")).toBeVisible();
  await expect(page.getByText("No securities or tokens have been issued.")).toBeVisible();
  const txText = await page.getByText(/ISSUE transaction RTX-\d{6}/).textContent();
  const txId = txText!.match(/RTX-\d{6}/)![0];
  await page.screenshot({ path: "docs/screenshots/journey-confirmation.png", fullPage: true });

  // Explorer shows the transaction.
  await page.goto(`/chain?tx=${txId}`);
  await expect(page.getByText("Transaction detail")).toBeVisible();
  await expect(page.locator("dd", { hasText: txId }).first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/chain-explorer.png", fullPage: true });

  // Supervisor view lists it in the feed.
  await page.goto("/supervisor");
  await expect(page.getByText("Illustrative supervisory view — not a Central Bank system")).toBeVisible();
  await expect(page.getByText(txId).first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/supervisor.png", fullPage: true });

  // Dashboard shows the holding (admin maps to the demo investor).
  await page.goto("/dashboard/portfolio");
  await expect(page.getByText(txId).first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/dashboard-portfolio.png", fullPage: true });

  expect(errors).toEqual([]);
});

test("explorer: verify chain passes and a transfer to an unverified wallet is rejected", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop only");
  await page.goto("/chain");
  await page.getByRole("tab", { name: "Verify & controls" }).click();
  await page.getByRole("button", { name: "Verify chain" }).click();
  await expect(page.getByText(/Chain verified — no discrepancies/)).toBeVisible();
  await page.getByRole("button", { name: /unverified external wallet/ }).click();
  await expect(page.getByText("Reason code: RECIPIENT_UNVERIFIED")).toBeVisible();
});

test("presentation: 12 slides, keyboard navigation, speaker notes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop only");
  await loginAs(page, "admin");
  await page.goto("/presentation");
  await expect(page.getByText("1 / 12")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 / 12")).toBeVisible();
  await page.keyboard.press("n");
  await expect(page.getByRole("complementary", { name: "Speaker notes" })).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByText("12 / 12")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/presentation.png" });
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/admin\/overview/);
});

test("screenshots of key screens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop only");
  await page.goto("/");
  await page.screenshot({ path: "docs/screenshots/landing.png", fullPage: true });
  await page.goto("/properties/dublin-8-two-bed?tab=passport");
  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({ path: "docs/screenshots/home-passport.png", fullPage: true });
  await page.goto("/roadmap");
  await page.screenshot({ path: "docs/screenshots/roadmap.png", fullPage: true });
  await page.goto("/regulatory-demo");
  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({ path: "docs/screenshots/regulatory-demo.png", fullPage: true });
  await loginAs(page, "tenant");
  await page.goto("/dashboard/tenant");
  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({ path: "docs/screenshots/tenant-staircasing.png", fullPage: true });
});
