import { expect, test } from "@playwright/test";

test.describe("investor journey", () => {
  test.skip(({ isMobile }) => isMobile, "journey runs once, at desktop width");

  test("log in → invest €1,000 in Dublin 8 → dashboard shows the holding and its Raya Chain tx", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login?next=/invest/prop-d8");
    await page.getByRole("button", { name: /Continue as Aoife/ }).click();
    await page.waitForURL("**/invest/prop-d8");

    // Step 2 — amount (default €1,000)
    await expect(page.getByRole("heading", { name: /How much would you invest/ })).toBeVisible();
    await expect(page.getByText("€4.68").first()).toBeVisible();
    await page.getByRole("button", { name: /Continue to onboarding/ }).click();

    // Step 3 — simulated onboarding
    await page.getByRole("button", { name: "Confirm details" }).click();
    await page.getByRole("button", { name: "Continue" }).click(); // ID check
    await page.getByRole("button", { name: "Continue" }).click(); // AML
    await page.getByRole("button", { name: "Continue" }).click(); // classification (retail)
    for (const answer of [
      "I could lose some or all of it",
      "No — I may have to hold until maturity or a sale",
      "No — fees and taxes reduce what I receive, and it isn’t guaranteed",
      "Notes in the company that owns the home",
      /^No$/,
    ]) {
      await page.getByRole("button", { name: answer }).click();
    }
    await page.getByRole("button", { name: "Check answers" }).click();
    await expect(page.getByText("5 of 5 correct — passed.")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/I understand I could lose the whole/).check();
    await page.getByRole("button", { name: "Finish onboarding" }).click();

    // Step 4 — risk acknowledgement, exact wording
    await expect(page.getByText("Property investments involve risk, including possible loss of capital. Returns are not guaranteed and investments may be illiquid.").first()).toBeVisible();
    await page.getByLabel("I have read and understood the risk warning above.").check();
    await page.getByRole("button", { name: /Continue to review/ }).click();

    // Step 5 — review
    await expect(page.getByText(/4-day reflection period/)).toBeVisible();
    await page.getByRole("button", { name: /Confirm simulated investment/ }).click();

    // Step 6 — confirmation + receipt
    await expect(page.getByRole("heading", { name: "Simulation Completed" })).toBeVisible();
    await expect(page.getByText("No real money has been transferred.")).toBeVisible();
    await expect(page.getByText("No securities or tokens have been issued.")).toBeVisible();
    await expect(page.getByText("Recorded on Raya Chain · simulated")).toBeVisible();
    const chainLink = page.getByRole("link", { name: /View on Raya Chain/ });
    const href = await chainLink.getAttribute("href");
    expect(href).toMatch(/^\/chain\?tx=0x[0-9a-f]{40}$/);
    const txId = href!.split("=")[1];

    // Dashboard reflects it: Aoife's seed €3,500 + €1,000
    await page.getByRole("link", { name: /Go to my dashboard/ }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByText("€4,500").first()).toBeVisible();
    await page.goto("/dashboard/transactions");
    await expect(page.locator(`a[href="/chain?tx=${txId}"]`)).toBeVisible();
    await page.goto("/dashboard/portfolio");
    await expect(page.getByRole("button", { name: "Withdraw" })).toBeVisible();
  });
});
