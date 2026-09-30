import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:8082',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run server',
    url: 'http://127.0.0.1:8082/api/health',
    env: { PORT: '8082', DB_NAME: 'violet_garden_e2e' },
    reuseExistingServer: false,
    timeout: 60000,
  },
})
