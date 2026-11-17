import { defineConfig, devices } from '@playwright/test'

const PORTA = 3200

// Test end-to-end sulla build di produzione, con il Chrome installato sul computer
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'telefono', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'computer', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    timeout: 300_000,
    reuseExistingServer: true,
  },
})
