import { defineConfig } from "@playwright/test";
import {
  makePreferences,
  COOKIE_PREFERENCES_KEY,
} from "./src/services/cookiePreferences.js";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  use: {
    baseURL: "http://localhost:5173",
    channel: "chrome",
    headless: true,
    // Existing non-consent regressions begin with a necessary-only choice.
    // Consent scenarios explicitly use an empty, first-visit browser state.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:5173",
          localStorage: [
            {
              name: COOKIE_PREFERENCES_KEY,
              value: JSON.stringify(makePreferences(false)),
            },
          ],
        },
      ],
    },
  },
  workers: 1,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
