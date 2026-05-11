# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Test - Full Auth Flow >> Full registration and login flow
- Location: tests\smoke.spec.ts:36:7

# Error details

```
Error: locator.waitFor: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-testid="verification-section"]') to be visible

```

# Test source

```ts
  1   | import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
  2   | import path from 'path';
  3   | import fs from 'fs';
  4   | 
  5   | test.describe('Smoke Test - Full Auth Flow', () => {
  6   |   let app: ElectronApplication;
  7   |   let window: Page;
  8   |   const userDataPath = path.join(process.cwd(), 'test-user-data');
  9   | 
  10  |   test.beforeAll(async () => {
  11  |     if (fs.existsSync(userDataPath)) {
  12  |       fs.rmSync(userDataPath, { recursive: true, force: true });
  13  |     }
  14  |     app = await electron.launch({
  15  |       args: ['.', '--no-sandbox', `--user-data-dir=${userDataPath}`],
  16  |       env: {
  17  |         ...process.env,
  18  |         NODE_ENV: 'development',
  19  |         SMOKE_TEST: 'true',
  20  |       }
  21  |     });
  22  | 
  23  |     window = await app.firstWindow();
  24  |     await window.waitForLoadState('domcontentloaded');
  25  |   });
  26  | 
  27  |   test.afterAll(async () => {
  28  |     if (app) await app.close();
  29  |     if (fs.existsSync(userDataPath)) {
  30  |       try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (_err) {
  31  |         // Ignore errors during cleanup
  32  |       }
  33  |     }
  34  |   });
  35  | 
  36  |   test('Full registration and login flow', async () => {
  37  |     console.log('🚀 Starting Smoke Test...');
  38  | 
  39  |     // Wait for initial load
  40  |     await window.waitForSelector('input', { timeout: 20000 });
  41  |     
  42  |     const timestamp = Date.now();
  43  |     const uniqueUsername = `smoke_${timestamp}`;
  44  |     const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
  45  |     const password = 'SmokeTestPassword123!';
  46  | 
  47  |     console.log(`👤 Step 1: Trying to login with non-existent user (${uniqueUsername})`);
  48  |     await window.locator('#auth-username').fill(uniqueUsername);
  49  |     const loginPassInput = window.locator('#auth-password');
  50  |     await loginPassInput.fill(password);
  51  |     await window.locator('button[type="submit"]').click();
  52  | 
  53  |     // Expect an error (the UI should show an error message)
  54  |     // Give it a moment to show the error
  55  |     await window.waitForTimeout(1000);
  56  | 
  57  |     console.log('📝 Switching to Register Mode...');
  58  |     const registerModeButton = window.locator('.auth-switch button').nth(1);
  59  |     await registerModeButton.click();
  60  |     
  61  |     // Verify we are actually in Register mode
  62  |     await expect(window.locator('#register-email')).toBeVisible({ timeout: 10000 });
  63  | 
  64  |     console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
  65  |     const emailInput = window.locator('#register-email');
  66  |     const usernameInput = window.locator('#auth-username');
  67  |     
  68  |     await emailInput.fill(uniqueEmail);
  69  |     await usernameInput.fill(uniqueUsername);
  70  |     
  71  |     // Ensure values are set
  72  |     await expect(emailInput).toHaveValue(uniqueEmail);
  73  |     await expect(usernameInput).toHaveValue(uniqueUsername);
  74  |     
  75  |     // Small delay to let React state settle
  76  |     await window.waitForTimeout(500);
  77  |     
  78  |     console.log('🔘 Submitting Step 1...');
  79  |     await window.locator('button[type="submit"]').click();
  80  | 
  81  |     console.log('🔑 Step 3: Filling passwords...');
  82  |     const passInput = window.locator('#auth-password');
  83  |     await expect(passInput).toBeVisible({ timeout: 15000 });
  84  |     await expect(window.locator('#auth-password-confirm')).toBeVisible({ timeout: 15000 });
  85  |     
  86  |     await passInput.fill(password);
  87  |     await window.locator('#auth-password-confirm').fill(password);
  88  |     
  89  |     console.log('📡 Submitting registration form...');
  90  |     
  91  |     await window.locator('button[type="submit"]').click();
  92  | 
  93  |     console.log('📧 Waiting for Verification Screen...');
  94  |     const verificationSection = window.locator('[data-testid="verification-section"]');
  95  |     const codeInput = window.locator('input[data-input-otp]');
  96  |     try {
> 97  |       await verificationSection.waitFor({ state: 'visible', timeout: 30000 });
      |                                 ^ Error: locator.waitFor: Target page, context or browser has been closed
  98  |       await codeInput.waitFor({ state: 'attached', timeout: 30000 });
  99  |     } catch (e) {
  100 |       console.error('Timeout waiting for email code input.');
  101 |       const errorText = await window.locator('[role="alert"]').textContent().catch(() => null);
  102 |       if (errorText) {
  103 |         console.error(`UI Error Message: ${errorText}`);
  104 |       } else {
  105 |         console.error('No UI Error Message found.');
  106 |       }
  107 |       throw e;
  108 |     }
  109 | 
  110 |     console.log('🔍 Waiting for intercepted test code...');
  111 |     let finalVerificationCode = '';
  112 | 
  113 |     if (!finalVerificationCode) {
  114 |       const devCodeText = await window
  115 |         .locator('[data-testid="dev-verification-code"]')
  116 |         .first()
  117 |         .textContent()
  118 |         .catch(() => null);
  119 |       const devCodeMatch = devCodeText?.match(/(\d{6})/);
  120 |       finalVerificationCode = devCodeMatch?.[1] || '';
  121 |     }
  122 | 
  123 |     if (!finalVerificationCode) {
  124 |       for (let attempt = 0; attempt < 8 && !finalVerificationCode; attempt += 1) {
  125 |         finalVerificationCode = await window.evaluate(async () => {
  126 |           const electronAPI = (window as unknown as {
  127 |             electronAPI: {
  128 |               auth: {
  129 |                 getEmailVerificationStatus: () => Promise<{
  130 |                   success: boolean;
  131 |                   emailVerification?: { developmentCode?: string };
  132 |                 }>;
  133 |               };
  134 |             };
  135 |           }).electronAPI;
  136 |           const status = await electronAPI.auth.getEmailVerificationStatus();
  137 |           return status.emailVerification?.developmentCode || '';
  138 |         });
  139 |         if (!finalVerificationCode) {
  140 |           await window.waitForTimeout(1000);
  141 |         }
  142 |       }
  143 |     }
  144 | 
  145 |     if (!finalVerificationCode) {
  146 |       throw new Error('Could not resolve verification code.');
  147 |     }
  148 | 
  149 |     console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
  150 |     console.log(`🔘 Entering code: ${finalVerificationCode}`);
  151 |     await codeInput.fill(finalVerificationCode);
  152 |     await window.locator('button[type="submit"]').click();
  153 | 
  154 |     console.log('🏠 Waiting for Dashboard...');
  155 |     await window.waitForSelector('main', { timeout: 20000 });
  156 |     
  157 |     const isDashboardVisible = await window.locator('main').isVisible();
  158 |     expect(isDashboardVisible).toBe(true);
  159 |     console.log('✨ SUCCESS: Dashboard reached!');
  160 | 
  161 |     // Cleanup
  162 |     console.log(`🧹 Cleaning up test user...`);
  163 |     const cleanupResult = await window.evaluate(async () => {
  164 |       const electronAPI = (window as unknown as { electronAPI: { auth: { getSession: () => Promise<{ user: { id: string } }> }, admin: { deleteTestUser: (id: string) => Promise<{ success: boolean, error?: string }> } } }).electronAPI;
  165 |       const session = await electronAPI.auth.getSession();
  166 |       if (session.user?.id) {
  167 |         return await electronAPI.admin.deleteTestUser(session.user.id);
  168 |       }
  169 |       return { success: false, error: 'No user ID found' };
  170 |     });
  171 | 
  172 |     if (cleanupResult.success) {
  173 |       console.log('✅ Test user deleted successfully.');
  174 |     } else {
  175 |       console.warn(`⚠️ Failed to delete test user: ${cleanupResult.error}`);
  176 |     }
  177 |   });
  178 | });
  179 | 
  180 | 
```