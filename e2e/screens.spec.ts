import { expect, test } from "@playwright/test";

/** Full-page screenshots for visual review, plus basic health checks: no console errors, no horizontal overflow. */
const ROUTES = [
  "/",
  "/properties",
  "/properties/dublin-8-two-bed",
  "/properties/limerick-city-refurbishment",
  "/how-it-works",
  "/about",
  "/impact",
  "/faq",
  "/compliance",
  "/legal/risk-disclosure",
  "/legal/privacy",
  "/legal/terms",
  "/login",
  "/register",
];

/** Routes linked from the shell but built in later sessions. Their prefetch 404s are tolerated until then. */
const PENDING = ["/chain", "/roadmap", "/regulatory-demo"];

for (const route of ROUTES) {
  test(`screens ${route}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
    page.on("response", (r) => {
      const path = new URL(r.url()).pathname;
      if (r.status() >= 400 && !PENDING.some((p) => path.startsWith(p))) errors.push(`${r.status()} ${path}`);
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(route, { waitUntil: "load" });
    // Scroll through so lazy images load before the capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const name = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
    await page.screenshot({ path: `test-results/screens/${name}-${info.project.name}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
    expect(errors, "console errors").toEqual([]);
  });
}
