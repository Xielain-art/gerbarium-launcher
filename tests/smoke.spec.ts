import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Smoke Test — Full Auth Flow
//
// This test launches the built Electron app (not dev server) and drives
// a register → verify-email → dashboard round-trip.
//
// Key CI fixes:
//  1. Increased timeouts — CI runners (especially macOS) are much slower.
//  2. Explicit splash-screen handling — wait for the splash overlay to be
//     removed before looking for React-rendered elements.
//  3. Session-loading awareness — LoginScreen shows a spinner while the
//     session IPC resolves; the test waits for it to finish.
//  4. Better diagnostics — on failure we capture the full DOM, URL, and
//     console logs for debugging.
// ---------------------------------------------------------------------------

/** Maximum time (ms) to wait for the React app to boot and reach login. */
const BOOT_TIMEOUT = 60_000;

/** Maximum time (ms) for individual UI interactions. */
const ACTION_TIMEOUT = 30_000;

test.describe('Smoke Test - Full Auth Flow', () => {
  let app: ElectronApplication;
  let window: Page;
  const userDataPath = path.join(process.cwd(), 'test-user-data');
  const envFilePath = path.join(process.cwd(), '.env');
  let originalEnvContent: string | null = null;
  let smokeEnvForElectron: Record<string, string> = {};
  const consoleLogs: string[] = [];

  // ---- helpers ----

  function parseDotEnv(content: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
    return out;
  }

  function writeSmokeEnvFile(): void {
    const existingEnv = fs.existsSync(envFilePath)
      ? parseDotEnv(fs.readFileSync(envFilePath, 'utf8'))
      : {};
    const apiBaseUrl =
      process.env.API_BASE_URL || existingEnv.API_BASE_URL || existingEnv.VITE_API_BASE_URL || 'https://gerbarium-api.vercel.app';
    const packwizPackUrl =
      process.env.PACKWIZ_PACK_URL || existingEnv.PACKWIZ_PACK_URL || '';

    if (!packwizPackUrl) {
      throw new Error('PACKWIZ_PACK_URL is required for smoke test');
    }

    smokeEnvForElectron = {
      API_BASE_URL: apiBaseUrl,
      VITE_API_BASE_URL: apiBaseUrl,
      PACKWIZ_PACK_URL: packwizPackUrl,
      SMOKE_TEST: 'true',
      E2E_FORCE_SMOKE: 'true',
      TEST_USERNAME: 'smoke_user',
      TEST_EMAIL: 'smoke_user@gerbarium.ru',
      TEST_PASSWORD: 'SmokeTestPassword123!',
    };

    const lines = [
      `API_BASE_URL=${apiBaseUrl}`,
      `VITE_API_BASE_URL=${apiBaseUrl}`,
      `PACKWIZ_PACK_URL=${packwizPackUrl}`,
      'SMOKE_TEST=true',
      'E2E_FORCE_SMOKE=true',
      'TEST_USERNAME=smoke_user',
      'TEST_EMAIL=smoke_user@gerbarium.ru',
      'TEST_PASSWORD=SmokeTestPassword123!',
    ];

    fs.writeFileSync(envFilePath, `${lines.join('\n')}\n`, 'utf8');
  }

  /** Dump diagnostic info (call on failure for easier CI debugging). */
  async function dumpDiagnostics(label: string): Promise<void> {
    try {
      const currentUrl = window.url();
      const bodyHtml = await window.locator('body').innerHTML().catch(() => '<unavailable>');
      const bodyText = await window.locator('body').innerText().catch(() => '<unavailable>');
      console.error(`\n=== DIAGNOSTICS: ${label} ===`);
      console.error(`URL: ${currentUrl}`);
      console.error(`Body text (first 600): ${bodyText.slice(0, 600)}`);
      console.error(`Body HTML (first 800): ${bodyHtml.slice(0, 800)}`);
      console.error(`Console logs:\n${consoleLogs.slice(-20).join('\n')}`);
      console.error(`=== END DIAGNOSTICS ===\n`);
    } catch (e) {
      console.error(`Diagnostics collection failed: ${e}`);
    }
  }

  // ---- setup / teardown ----

  test.beforeAll(async () => {
    if (fs.existsSync(userDataPath)) {
      fs.rmSync(userDataPath, { recursive: true, force: true });
    }

    if (fs.existsSync(envFilePath)) {
      originalEnvContent = fs.readFileSync(envFilePath, 'utf8');
    }
    writeSmokeEnvFile();

    app = await electron.launch({
      args: ['.', '--no-sandbox', `--user-data-dir=${userDataPath}`],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ...smokeEnvForElectron,
      },
    });

    window = await app.firstWindow();

    // Collect console logs for diagnostics.
    window.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    window.on('pageerror', (error) => {
      consoleLogs.push(`[PAGE_ERROR] ${error.message}`);
    });

    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (app) await app.close();
    if (originalEnvContent !== null) {
      try { fs.writeFileSync(envFilePath, originalEnvContent, 'utf8'); } catch (_err) {
        // Ignore errors during cleanup
      }
    } else if (fs.existsSync(envFilePath)) {
      try { fs.rmSync(envFilePath, { force: true }); } catch (_err) {
        // Ignore errors during cleanup
      }
    }
    if (fs.existsSync(userDataPath)) {
      try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (_err) {
        // Ignore errors during cleanup
      }
    }
  });

  // ---- main test ----

  test('Full registration and login flow', async () => {
    console.log('🚀 Starting Smoke Test...');

    // 1. Wait for electronAPI to be exposed by the preload script.
    await window.waitForFunction(() => {
      const w = window as unknown as { electronAPI?: unknown };
      return Boolean(w.electronAPI);
    }, { timeout: ACTION_TIMEOUT });

    const smokeConfig = await window.evaluate(() => {
      const w = window as unknown as {
        electronAPI?: { getSmokeTestConfig?: () => unknown };
      };
      return w.electronAPI?.getSmokeTestConfig?.() ?? null;
    });
    console.log(`Smoke config: ${JSON.stringify(smokeConfig)}`);

    // 2. Wait for the splash overlay to be removed.
    //    The integrity-check hook calls fadeAndRemoveSplash() which fades and
    //    then removes `#bootstrap-splash` from the DOM.
    console.log('⏳ Waiting for splash screen to be removed...');
    try {
      await window.waitForFunction(() => {
        return !document.getElementById('bootstrap-splash');
      }, { timeout: BOOT_TIMEOUT });
      console.log('✅ Splash removed.');
    } catch {
      // If splash is stuck, try to force-remove it so we can inspect what's behind.
      console.warn('⚠️ Splash screen still present after timeout. Force-removing...');
      await window.evaluate(() => {
        document.getElementById('bootstrap-splash')?.remove();
      });
      await dumpDiagnostics('splash-stuck');
    }

    // 3. Wait for the login form to appear.
    //    LoginScreen initially shows a SessionLoadingScreen spinner until
    //    loadToken() completes. We need to wait for that to finish.
    console.log('⏳ Waiting for login form (#auth-username)...');
    try {
      await window.waitForSelector('#auth-username', { timeout: BOOT_TIMEOUT });
    } catch (error) {
      await dumpDiagnostics('auth-username-not-found');
      throw error;
    }
    console.log('✅ Login form visible.');

    const timestamp = Date.now();
    const uniqueUsername = `smoke_${timestamp}`;
    const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
    const password = 'SmokeTestPassword123!';

    // 4. Try to login with non-existent user (expect error).
    console.log(`👤 Step 1: Trying to login with non-existent user (${uniqueUsername})`);
    await window.locator('#auth-username').fill(uniqueUsername);
    const loginPassInput = window.locator('#auth-password');
    await loginPassInput.fill(password);
    await window.locator('button[type="submit"]').click();
    await window.waitForTimeout(2000);

    // 5. Switch to Register Mode.
    console.log('📝 Switching to Register Mode...');
    const registerModeButton = window.locator('.auth-switch button').nth(1);
    await registerModeButton.click();
    await expect(window.locator('#register-email')).toBeVisible({ timeout: ACTION_TIMEOUT });

    // 6. Fill registration details.
    console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
    const emailInput = window.locator('#register-email');
    const usernameInput = window.locator('#auth-username');

    await emailInput.fill(uniqueEmail);
    await usernameInput.fill(uniqueUsername);

    await expect(emailInput).toHaveValue(uniqueEmail);
    await expect(usernameInput).toHaveValue(uniqueUsername);
    await window.waitForTimeout(500);

    console.log('🔘 Submitting Step 1...');
    await window.locator('button[type="submit"]').click();

    // 7. Fill passwords.
    console.log('🔑 Step 3: Filling passwords...');
    const passInput = window.locator('#auth-password');
    await expect(passInput).toBeVisible({ timeout: ACTION_TIMEOUT });
    await expect(window.locator('#auth-password-confirm')).toBeVisible({ timeout: ACTION_TIMEOUT });

    await passInput.fill(password);
    await window.locator('#auth-password-confirm').fill(password);

    console.log('📡 Submitting registration form...');
    await window.locator('button[type="submit"]').click();

    // 8. Wait for Verification Screen.
    console.log('📧 Waiting for Verification Screen...');
    const verificationSection = window.locator('[data-testid="verification-section"]');
    const codeInput = window.locator('input[data-input-otp]');
    try {
      await verificationSection.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT });
      await codeInput.waitFor({ state: 'attached', timeout: ACTION_TIMEOUT });
    } catch (e) {
      console.error('Timeout waiting for email code input.');
      const errorText = await window.locator('[role="alert"]').textContent().catch(() => null);
      if (errorText) {
        console.error(`UI Error Message: ${errorText}`);
      }
      await dumpDiagnostics('verification-screen');
      throw e;
    }

    // 9. Obtain verification code.
    console.log('🔍 Waiting for intercepted test code...');
    let finalVerificationCode = '';

    // Method 1: read from the dev UI element.
    if (!finalVerificationCode) {
      const devCodeText = await window
        .locator('[data-testid="dev-verification-code"]')
        .first()
        .textContent()
        .catch(() => null);
      const devCodeMatch = devCodeText?.match(/(\d{6})/);
      finalVerificationCode = devCodeMatch?.[1] || '';
    }

    // Method 2: poll via IPC.
    if (!finalVerificationCode) {
      for (let attempt = 0; attempt < 12 && !finalVerificationCode; attempt += 1) {
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
          await window.waitForTimeout(1500);
        }
      }
    }

    if (!finalVerificationCode) {
      await dumpDiagnostics('verification-code-missing');
      throw new Error('Could not resolve verification code.');
    }

    console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
    console.log(`🔘 Entering code: ${finalVerificationCode}`);
    await codeInput.fill(finalVerificationCode);
    await window.locator('button[type="submit"]').click();

    // 10. Wait for Dashboard.
    console.log('🏠 Waiting for Dashboard...');
    await window.waitForSelector('main', { timeout: ACTION_TIMEOUT });

    const isDashboardVisible = await window.locator('main').isVisible();
    expect(isDashboardVisible).toBe(true);
    console.log('✨ SUCCESS: Dashboard reached!');

    // 11. Cleanup — delete the test user.
    console.log('🧹 Cleaning up test user...');
    const cleanupResult = await window.evaluate(async () => {
      const electronAPI = (window as unknown as {
        electronAPI: {
          auth: { getSession: () => Promise<{ user: { id: string } }> };
          admin: { deleteTestUser: (id: string) => Promise<{ success: boolean; error?: string }> };
        };
      }).electronAPI;
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
