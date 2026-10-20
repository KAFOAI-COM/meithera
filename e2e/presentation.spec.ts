import { expect, test } from "@playwright/test";

test.describe("regulatory presentation", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard run-through at desktop width");

  test("admin launches the deck, walks all 12 slides by keyboard, opens notes and exits", async ({ page }) => {
    await page.goto("/login?next=/admin/overview");
    await page.getByRole("button", { name: /Continue as Administrator/ }).click();
    await page.waitForURL("**/admin/overview");
    await page.getByRole("link", { name: /Launch Regulatory Presentation/ }).click();
    await page.waitForURL("**/presentation");
    await expect(page.getByText("Demonstration Platform — No Real Investments Available")).toBeVisible();
    const progress = page.getByRole("progressbar", { name: "Slide progress" });
    await expect(progress).toHaveAttribute("aria-valuenow", "1");
    for (let n = 2; n <= 12; n++) {
      await page.keyboard.press("ArrowRight");
      await expect(progress).toHaveAttribute("aria-valuenow", String(n));
    }
    await page.keyboard.press("ArrowRight"); // stays on the last slide
    await expect(progress).toHaveAttribute("aria-valuenow", "12");
    await page.keyboard.press("n");
    await expect(page.getByRole("complementary", { name: "Speaker notes" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(progress).toHaveAttribute("aria-valuenow", "11");
    await page.keyboard.press("Escape");
    await page.waitForURL("**/admin/overview");
  });

  test("investors cannot open the presentation", async ({ page }) => {
    await page.goto("/login?next=/presentation");
    await page.getByRole("button", { name: /Continue as Aoife/ }).click();
    await page.waitForURL(/error=presentation/);
    await expect(page.getByRole("alert").filter({ hasText: "presentation needs" })).toBeVisible();
  });
});
