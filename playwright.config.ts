import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  use: {
    reducedMotion: "reduce",
    baseURL: "http://127.0.0.1:3198",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next start --port 3198",
    url: "http://127.0.0.1:3198",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
