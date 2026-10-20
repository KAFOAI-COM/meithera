import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3417);

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  // One retry: a rare (~1.5%), production-only, recoverable React #418 hydration warning is under investigation (see CLAUDE.md).
  retries: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !!process.env.REUSE_SERVER,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
