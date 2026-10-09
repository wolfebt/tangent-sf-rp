import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Tangent SF RP
 * Configured for headless WebGL / SwiftShader GPU emulation
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-webgl',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: process.env.CI ? [
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-webgl',
            '--enable-unsafe-webgpu',
            '--ignore-gpu-blocklist',
            '--disable-dev-shm-usage',
          ] : [
            '--enable-webgl',
            '--ignore-gpu-blocklist',
          ],
        },
      },
    },
    {
      name: 'mobile-tablet',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
