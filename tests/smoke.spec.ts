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
    const registerModeButton = window.locator('.auth-switch button').nth(1);
    await registerModeButton.click();
    
    // Verify we are actually in Register mode
    await expect(window.locator('#register-email')).toBeVisible({ timeout: 10000 });

    console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
    const emailInput = window.locator('#register-email');
    const usernameInput = window.locator('#auth-username');
    
    await emailInput.fill(uniqueEmail);
    await usernameInput.fill(uniqueUsername);
    
    // Ensure values are set
    await expect(emailInput).toHaveValue(uniqueEmail);
    await expect(usernameInput).toHaveValue(uniqueUsername);
    
    // Small delay to let React state settle
    await window.waitForTimeout(500);
    
    console.log('🔘 Submitting Step 1...');
    await window.locator('button[type="submit"]').click();

    console.log('🔑 Step 3: Filling passwords...');
    const passInput = window.locator('#auth-password');
    await expect(passInput).toBeVisible({ timeout: 15000 });
    await expect(window.locator('#auth-password-confirm')).toBeVisible({ timeout: 15000 });
    
    await passInput.fill(password);
    await window.locator('#auth-password-confirm').fill(password);
    
    console.log('📡 Submitting registration form...');
    
    await window.locator('button[type="submit"]').click();

    console.log('📧 Waiting for Verification Screen...');
    const verificationSection = window.locator('[data-testid="verification-section"]');
    const codeInput = window.locator('input[data-input-otp]');
    try {
      await verificationSection.waitFor({ state: 'visible', timeout: 30000 });
      await codeInput.waitFor({ state: 'attached', timeout: 30000 });
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
    let finalVerificationCode = '';

    if (!finalVerificationCode) {
      const devCodeText = await window
        .locator('[data-testid="dev-verification-code"]')
        .first()
        .textContent()
        .catch(() => null);
      const devCodeMatch = devCodeText?.match(/(\d{6})/);
      finalVerificationCode = devCodeMatch?.[1] || '';
    }

    if (!finalVerificationCode) {
      for (let attempt = 0; attempt < 8 && !finalVerificationCode; attempt += 1) {
        finalVerificationCode = await window.evaluate(async () => {
          const electronAPI = (window as unknown as {
            electronAPI: {
              auth: {
                getEmailVerificationStatus: () => Promise<{
                  success: boolean;
                  emailVerification?: { developmentCode?: string };
                }>;
              };
            };
          }).electronAPI;
          const status = await electronAPI.auth.getEmailVerificationStatus();
          return status.emailVerification?.developmentCode || '';
        });
        if (!finalVerificationCode) {
          await window.waitForTimeout(1000);
        }
      }
    }

    if (!finalVerificationCode) {
      throw new Error('Could not resolve verification code.');
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

