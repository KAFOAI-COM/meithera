import { expect, type Page } from "@playwright/test";

/** Fail the test on any console error, except known-benign dev noise. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/favicon|hydration|Download the React DevTools|net::ERR_ABORTED/i.test(t)) return;
    errors.push(t);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

export async function expectNoHorizontalOverflow(page: Page) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, "no horizontal overflow").toBeLessThanOrEqual(iw + 1);
}

export async function loginAs(page: Page, persona: "investor" | "tenant" | "supervisor" | "admin", next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByTestId(`login-${persona}`).click();
  // The server action sets the cookie and redirects; wait until we have left /login (or landed on a role error).
  await page.waitForURL((u) => !u.pathname.startsWith("/login") || u.search.includes("error="), { timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded");
}

export async function demoBannerVisible(page: Page) {
  await expect(page.getByText("Demonstration Platform — No Real Investments Available").first()).toBeVisible();
}
