import { defineConfig, devices } from '@playwright/test';

const FRONT_URL   = 'http://localhost:5173';
const BACKEND_DIR = '../Backend';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  globalSetup: './e2e/global-setup.js',
  use: {
    baseURL: FRONT_URL,
    storageState: './e2e/.auth/admin.json',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node scripts/e2e-seed.js && npm run start',
      cwd: BACKEND_DIR,
      url: 'http://localhost:3000/api',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev',
      cwd: '.',
      url: FRONT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
