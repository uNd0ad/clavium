import { defineConfig, devices } from '@playwright/test'

// E2E pe calea critică. Rulează aplicația local (dev sau, în CI, build + start) și conduce un
// browser real. Browserele se instalează o singură dată cu `npx playwright install chromium`.
const PORT = Number(process.env.E2E_PORT) || 3000
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Pornește serverul dacă nu rulează deja unul. În CI: build + start (producție); local: dev.
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
