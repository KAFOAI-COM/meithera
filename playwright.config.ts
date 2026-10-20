import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a PRODUCTION build (`pnpm build` first), which is also what the meeting laptop runs.
 * The dev server is deliberately not used: its live-reload channel never goes network-idle and it
 * compiles routes on demand, which is flaky under parallel workers.
 */
const port = Number(process.env.E2E_PORT ?? 3471);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 1,
  workers: 4,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: `pnpm start -p ${port}`,
    url: baseURL,
    // Never attach to a stranger on the port: if something is already listening, fail loudly.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
