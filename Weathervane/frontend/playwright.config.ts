import { defineConfig, devices } from "@playwright/test";

// Runs against the full Docker stack (frontend :3004 → backend :4004).
// Override the target with PLAYWRIGHT_BASE_URL when running elsewhere.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3004";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
