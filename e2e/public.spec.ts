import { expect, test } from "@playwright/test";

test.describe("public site journeys", () => {
  test.skip(({ isMobile }) => isMobile, "functional checks run once, at desktop width");

  test("persona login honours ?next= and the header reflects the persona", async ({ page }) => {
    await page.goto("/login?next=/properties");
    await expect(page.getByText("After logging in you’ll continue to")).toBeVisible();
    await page.getByRole("button", { name: /Continue as Aoife/ }).click();
    await page.waitForURL("**/properties");
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
  });

  test("role errors explain which persona is needed", async ({ page }) => {
    await page.goto("/login?next=/admin/overview&error=admin");
    // Next.js also renders a route announcer with role="alert", so match ours by its text.
    await expect(page.getByRole("alert").filter({ hasText: "Administrator persona" })).toBeVisible();
  });

  test("gallery lightbox opens and closes with the keyboard", async ({ page }) => {
    await page.goto("/properties/dublin-8-two-bed");
    await page.getByRole("button", { name: /View 4 photos/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("1 / 4");
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toContainText("2 / 4");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("calculator recomputes gross to net from finance.ts", async ({ page }) => {
    await page.goto("/properties/dublin-8-two-bed#calculator");
    const calc = page.locator("#calculator");
    await expect(calc).toContainText("€48.16"); // €1,000 default → €48.16 a year
    await calc.getByRole("button", { name: "€10,000" }).click();
    await expect(calc).toContainText("€481.64");
    await expect(calc).toContainText("€150.00"); // 1.5% acquisition fee
  });

  test("passport entries link to Raya Chain transactions", async ({ page }) => {
    await page.goto("/properties/limerick-city-refurbishment#passport");
    const links = page.locator('#passport a[href^="/chain?tx=0x"]');
    expect(await links.count()).toBeGreaterThanOrEqual(5);
  });
});
