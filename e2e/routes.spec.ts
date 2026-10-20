import { test, expect } from "@playwright/test";
import { demoBannerVisible, expectNoHorizontalOverflow, loginAs, watchConsole } from "./helpers";

const PUBLIC = ["/", "/properties", "/properties/dublin-8-two-bed", "/properties/cork-city-terrace?tab=passport", "/how-it-works", "/roadmap", "/chain", "/agents", "/impact", "/compliance", "/regulatory-demo", "/about", "/faq", "/legal/risk-disclosure", "/legal/privacy", "/legal/terms", "/login", "/register"];

const ADMIN = ["/invest", "/invest/prop-cork", "/dashboard", "/dashboard/portfolio", "/dashboard/income", "/dashboard/transactions", "/dashboard/documents", "/dashboard/settings", "/dashboard/tenant", "/supervisor", "/admin/overview", "/admin/properties", "/admin/investors", "/admin/spvs", "/admin/distributions", "/admin/ledger", "/admin/audit-log", "/presentation"];

for (const route of PUBLIC) {
  test(`public ${route}`, async ({ page }) => {
    const errors = watchConsole(page);
    const res = await page.goto(route);
    expect(res?.status(), `${route} status`).toBeLessThan(400);
    await page.waitForLoadState("domcontentloaded");
    await demoBannerVisible(page);
    await expectNoHorizontalOverflow(page);
    expect(errors, `console errors on ${route}`).toEqual([]);
  });
}

test.describe("authenticated routes (administrator)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });
  for (const route of ADMIN) {
    test(`admin ${route}`, async ({ page }) => {
      const errors = watchConsole(page);
      const res = await page.goto(route);
      expect(res?.status(), `${route} status`).toBeLessThan(400);
      await page.waitForLoadState("domcontentloaded");
      expect(page.url(), `${route} should not bounce to login`).not.toContain("/login");
      await demoBannerVisible(page);
      await expectNoHorizontalOverflow(page);
      expect(errors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test("404 page carries the demo banner", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist");
  expect(res?.status()).toBe(404);
  await demoBannerVisible(page);
});

test("role gates redirect to login with the right hint", async ({ page }) => {
  await page.goto("/supervisor");
  await expect(page).toHaveURL(/\/login\?next=%2Fsupervisor/);
  await loginAs(page, "investor", "/admin/overview");
  await expect(page).toHaveURL(/error=role/);
});
