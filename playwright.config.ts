import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 4173)

/**
 * E2E + accessibility tests run against the *generated static site*
 * (`pnpm generate` first), the same files that get deployed.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'a11y/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    command: `node tests/support/static-server.ts`,
    port,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port) },
  },
})
