import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'smoke.spec.ts',
  timeout: 180_000,
  retries: 1,
  workers: 1,
  use: {
    trace: 'on-first-retry',
  },
});
