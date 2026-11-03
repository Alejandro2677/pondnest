import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/live",
  timeout: 30000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:5174", channel: "chrome", headless: true },
  webServer: {
    command: "node scripts/live-test-server.js",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
  },
});
