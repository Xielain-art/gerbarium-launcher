import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Smoke Test - Full Auth Flow', () => {
  let app: any;
  let window: any;
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
      try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (e) {}
    }
  });

  test('Full registration and login flow', async () => {
    console.log('🚀 Starting Smoke Test...');

    // Listen for code in stdout
    let interceptedCode = '';
    app.process().stdout.on('data', (data: Buffer) => {
      const line = data.toString();

      // Catch our custom debug log from auth.ts
      if (line.includes('[DEBUG_API_')) {
        console.log(`📡 RAW API DATA: ${line.trim()}`);
      }

      // Catch the code from authHandler.ts
      const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
      if (match) {
        interceptedCode = match[1];
        console.log(`📡 Intercepted code from stdout: ${interceptedCode}`);
      }
    });

    app.process().stderr.on('data', (data: Buffer) => {
      console.error(`[APP_STDERR] ${data.toString().trim()}`);
    });

    // Wait for initial load
    await window.waitForSelector('input', { timeout: 20000 });
    
    const timestamp = Date.now();
    const uniqueUsername = `smoke_${timestamp}`;
    const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
    const password = 'SmokeTestPassword123!';

    console.log('📝 Switching to Register Mode...');
    await window.locator('.auth-switch__button').nth(1).click();

    console.log(`👤 Step 1: Filling account details (${uniqueUsername})`);
    await window.locator('#register-email').fill(uniqueEmail);
    await window.locator('#auth-username').fill(uniqueUsername);
    await window.locator('button[type="submit"]').click();

    console.log('🔑 Step 2: Filling passwords...');
    const passInput = window.locator('#auth-password');
    await passInput.waitFor({ state: 'visible' });
    await passInput.fill(password);
    await window.locator('#auth-password-confirm').fill(password);
    
    console.log('📡 Submitting registration form...');
    await window.locator('button[type="submit"]').click();

    console.log('📧 Waiting for Verification Screen...');
    const codeInput = window.locator('#email-code');
    await codeInput.waitFor({ state: 'visible', timeout: 15000 });

    console.log('🔍 Searching for development code...');
    
    let code = interceptedCode;
    
    // Fallback: manually trigger status check via Electron IPC to get developmentCode
    if (!code) {
      console.log('📡 Manually requesting verification status check...');
      try {
        const result = await window.evaluate(async () => {
          // Trigger the IPC handler via the exposed electronAPI in renderer process
          return await (window as any).electronAPI.auth.getEmailVerificationStatus();
        });
        
        if (result && result.success && result.emailVerification?.developmentCode) {
          code = result.emailVerification.developmentCode;
          console.log(`📡 Obtained code via manual check: ${code}`);
        }
      } catch (e) {
        console.error(`❌ Failed to manually request status check: ${e}`);
      }
      
      if (!code) {
        console.log('🔄 Checking global state as secondary fallback...');
        for (let i = 0; i < 10; i++) {
          code = await app.evaluate(() => (global as any).lastDevelopmentCode);
          if (code) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
    
    if (!code) {
      console.log('⚠️ Searching in UI as last resort...');
      const badgeWithCode = window.locator('div, span, p')
        .filter({ hasText: /DEV:?\s*\d{6}/ }) 
        .first();
      
      try {
        await expect(badgeWithCode).toBeVisible({ timeout: 5000 });
        const badgeText = await badgeWithCode.textContent();
        const codeMatch = badgeText?.match(/(\d{6})/);
        if (codeMatch) {
          code = codeMatch[1];
        }
      } catch (e) {
        console.log('❌ DEV badge not found in UI');
      }
    }

    if (code) {
      console.log(`✅ Found Verification Code: ${code}`);
      await codeInput.fill(code);
      console.log('🔘 Submitting code...');
      await window.locator('button[type="submit"]').click();
    } else {
      throw new Error('Could not find 6-digit verification code. Check if the API returns developmentCode in SMOKE_TEST mode.');
    }

    console.log('🏠 Waiting for Dashboard...');
    await window.waitForSelector('main', { timeout: 20000 });
    
    const isDashboardVisible = await window.locator('main').isVisible();
    expect(isDashboardVisible).toBe(true);
    console.log('✨ SUCCESS: Dashboard reached!');
  });
});
