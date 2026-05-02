import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'smoke.spec.ts',
  timeout: 45000,
  retries: 0,
  workers: 1,
  use: {
    trace: 'on-first-retry',
  },
});
