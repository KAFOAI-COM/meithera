import { expect, test } from "@playwright/test";

test.describe("Raya Chain explorer and admin controls", () => {
  test.skip(({ isMobile }) => isMobile, "functional checks run once, at desktop width");

  test("verify chain passes; a tampered copy is caught; the live record stays intact", async ({ page }) => {
    await page.goto("/chain");
    await page.getByRole("button", { name: "Verify chain" }).click();
    await expect(page.getByText(/blocks verified\. The record is intact\./)).toBeVisible();
    await page.getByRole("button", { name: "Tamper with a copy" }).click();
    await expect(page.getByText(/Broken at block #\d+/)).toBeVisible();
    await page.getByRole("button", { name: "Verify chain" }).click();
    await expect(page.getByText(/The record is intact\./)).toBeVisible();
  });

  test("a transfer to an unverified wallet is rejected with its reason", async ({ page }) => {
    await page.goto("/chain");
    await page.getByRole("button", { name: /Attempt transfer of 100 units/ }).click();
    await expect(page.getByText(/Rejected · RECIPIENT_NOT_VERIFIED/)).toBeVisible();
  });

  test("search filters the feed and a row opens the drawer", async ({ page }) => {
    await page.goto("/chain");
    await page.getByPlaceholder("Search tx, holder ID or property…").fill("Limerick");
    await page.getByRole("tab", { name: "Payouts" }).click();
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toContainText("Loan interest");
    await firstRow.click();
    await expect(page.getByRole("dialog", { name: "Transaction detail" })).toContainText("Loan interest");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("admin runs a monthly loan-interest distribution that lands on the chain", async ({ page }) => {
    await page.goto("/login?next=/admin/distributions");
    await page.getByRole("button", { name: /Continue as Administrator/ }).click();
    await page.waitForURL("**/admin/distributions");
    await page.getByRole("button", { name: /Run loan interest/ }).click();
    const result = page.getByRole("status").filter({ hasText: "recorded on Raya Chain" });
    await expect(result).toContainText("Limerick City · 2026-11");
    const href = await result.locator('a[href^="/chain?tx="]').first().getAttribute("href");
    await page.goto(href!);
    await expect(page.getByRole("dialog", { name: "Transaction detail" })).toContainText("2026-11");
  });

  test("admin freezes a holding and the supervisor sees it", async ({ page }) => {
    await page.goto("/login?next=/admin/audit-log");
    await page.getByRole("button", { name: /Continue as Administrator/ }).click();
    await page.waitForURL("**/admin/audit-log");
    await page.getByRole("button", { name: "Freeze holding" }).click();
    await expect(page.getByRole("status").filter({ hasText: "FREEZE · AML_REVIEW" })).toBeVisible();
    await page.getByRole("button", { name: "Record correction" }).click();
    await expect(page.getByRole("status").filter({ hasText: "CORRECTION · COURT_ORDER" })).toBeVisible();
    await page.getByRole("button", { name: "Verify audit chain" }).click();
    await expect(page.getByText(/events verified — the log is intact/)).toBeVisible();
    await page.goto("/supervisor");
    await expect(page.getByText(/· frozen|ID-[0-9A-F]+/).first()).toBeVisible();
    await expect(page.getByText("No holdings frozen.")).toBeHidden();
  });

  test("non-admin personas are kept out of /admin", async ({ page }) => {
    await page.goto("/login?next=/admin/overview");
    await page.getByRole("button", { name: /Continue as Supervisor/ }).click();
    await page.waitForURL(/\/login\?next=%2Fadmin%2Foverview&error=admin/);
    await expect(page.getByRole("alert").filter({ hasText: "Administrator persona" })).toBeVisible();
  });
});
