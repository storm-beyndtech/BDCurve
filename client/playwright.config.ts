import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    },
    trace: "retain-on-failure",
  },
});
