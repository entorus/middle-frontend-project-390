import { defineConfig } from '@playwright/test'

const localAppUrl = 'http://127.0.0.1:4173'
const appUrl = process.env.APP_URL ?? localAppUrl

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: appUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.APP_URL
    ? undefined
    : {
      command: 'cd .. && make build && PORT=4173 make start',
      reuseExistingServer: true,
      timeout: 120_000,
      url: `${localAppUrl}/api/cities`,
    },
})
