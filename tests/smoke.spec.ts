import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Smoke Test - Full Auth Flow', () => {
  let app: ElectronApplication;
  let window: Page;
  const userDataPath = path.join(process.cwd(), 'test-user-data');

  test.beforeAll(async () => {
    if (fs.existsSync(userDataPath)) {
      fs.rmSync(userDataPath, { recursive: true, force: true });
    }

    app = await electron.launch({
      args: ['.', '--no-sandbox', `--user-data-dir=${userDataPath}`],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        SMOKE_TEST: 'true',
      }
    });
    window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) await app.close();
    if (fs.existsSync(userDataPath)) {
      try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (_err) {
        // Ignore errors during cleanup
      }
    }
  });

  test('Full registration and login flow', async () => {
    console.log('🚀 Starting Smoke Test...');

    // Wait for initial load
    await window.waitForSelector('input', { timeout: 20000 });
    
    const timestamp = Date.now();
    const uniqueUsername = `smoke_${timestamp}`;
    const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
    const password = 'SmokeTestPassword123!';

    console.log(`👤 Step 1: Trying to login with non-existent user (${uniqueUsername})`);
    await window.locator('#auth-username').fill(uniqueUsername);
    const loginPassInput = window.locator('#auth-password');
    await loginPassInput.fill(password);
    await window.locator('button[type="submit"]').click();

    // Expect an error (the UI should show an error message)
    // Give it a moment to show the error
    await window.waitForTimeout(1000);

    console.log('📝 Switching to Register Mode...');
    await window.locator('.auth-switch__button').nth(1).click();

    console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
    await window.locator('#register-email').fill(uniqueEmail);
    await window.locator('#auth-username').fill(uniqueUsername);
    await window.locator('button[type="submit"]').click();

    console.log('🔑 Step 3: Filling passwords...');
    const passInput = window.locator('#auth-password');
    await passInput.waitFor({ state: 'visible' });
    await passInput.fill(password);
    await window.locator('#auth-password-confirm').fill(password);
    
    console.log('📡 Submitting registration form...');
    
    // Set up a promise to catch the stdout code before clicking submit
    const codePromise = new Promise<string>((resolve) => {
      const onData = (data: Buffer) => {
        const line = data.toString();
        const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
        if (match) {
          app.process().stdout.off('data', onData);
          resolve(match[1]);
        }
      };
      app.process().stdout.on('data', onData);
      
      // Safety timeout
      setTimeout(() => {
        app.process().stdout.off('data', onData);
        resolve('');
      }, 15000);
    });

    await window.locator('button[type="submit"]').click();

    console.log('📧 Waiting for Verification Screen...');
    const codeInput = window.locator('#email-code');
    try {
      await codeInput.waitFor({ state: 'visible', timeout: 30000 });
    } catch (e) {
      console.error('Timeout waiting for email code input.');
      const errorText = await window.locator('[role="alert"]').textContent().catch(() => null);
      if (errorText) {
        console.error(`UI Error Message: ${errorText}`);
      } else {
        console.error('No UI Error Message found.');
      }
      throw e;
    }

    console.log('🔍 Waiting for intercepted test code...');
    let finalVerificationCode = await codePromise;

    if (!finalVerificationCode) {
      console.log('🔄 Fallback: fetching code via evaluate');
      finalVerificationCode = await window.evaluate(() => (global as unknown as Record<string, unknown>).lastDevelopmentCode as string || '');
    }

    if (!finalVerificationCode) {
      throw new Error('Could not intercept verification code from stdout.');
    }

    console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
    console.log(`🔘 Entering code: ${finalVerificationCode}`);
    await codeInput.fill(finalVerificationCode);
    await window.locator('button[type="submit"]').click();

    console.log('🏠 Waiting for Dashboard...');
    await window.waitForSelector('main', { timeout: 20000 });
    
    const isDashboardVisible = await window.locator('main').isVisible();
    expect(isDashboardVisible).toBe(true);
    console.log('✨ SUCCESS: Dashboard reached!');

    // Cleanup
    console.log(`🧹 Cleaning up test user...`);
    const cleanupResult = await window.evaluate(async () => {
      const electronAPI = (window as unknown as { electronAPI: { auth: { getSession: () => Promise<{ user: { id: string } }> }, admin: { deleteTestUser: (id: string) => Promise<{ success: boolean, error?: string }> } } }).electronAPI;
      const session = await electronAPI.auth.getSession();
      if (session.user?.id) {
        return await electronAPI.admin.deleteTestUser(session.user.id);
      }
      return { success: false, error: 'No user ID found' };
    });

    if (cleanupResult.success) {
      console.log('✅ Test user deleted successfully.');
    } else {
      console.warn(`⚠️ Failed to delete test user: ${cleanupResult.error}`);
    }
  });
});
