# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Test - Full Auth Flow >> Full registration and login flow
- Location: tests\smoke.spec.ts:40:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('#auth-password') to be visible

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e7]:
      - button "Свернуть" [ref=e8]:
        - img [ref=e9]
      - button "Развернуть" [ref=e10]:
        - img [ref=e11]
      - button "Закрыть" [ref=e13]:
        - img [ref=e14]
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: Регистрация
            - generic [ref=e22]:
              - generic [ref=e23]: Язык
              - combobox [ref=e24]:
                - option "RU" [selected]
                - option "EN"
          - generic [ref=e25]:
            - generic [ref=e26]: Создать аккаунт
            - paragraph [ref=e27]: Создайте аккаунт, затем подтвердите email шестизначным кодом.
          - generic [ref=e29]:
            - button "Войти" [ref=e30]
            - button "Создать аккаунт" [ref=e31]
          - generic [ref=e32]:
            - generic [ref=e33]:
              - generic [ref=e34]: "1"
              - generic [ref=e35]: Данные аккаунта
            - generic [ref=e36]:
              - generic [ref=e37]: "2"
              - generic [ref=e38]: Защита аккаунта
          - alert [ref=e39]: Введите логин и пароль
        - generic [ref=e41]:
          - generic [ref=e42]:
            - text: Email
            - textbox "Email" [ref=e44]
          - generic [ref=e45]:
            - text: Username
            - textbox "Username" [ref=e47]: smoke_1777729495689
          - button "Далее" [active] [ref=e49]
      - generic [ref=e50]: Gerbarium Launcher v2.0
  - region "Notifications alt+T"
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
  14  | app = await electron.launch({
  15  |   args: ['.', '--no-sandbox', '--remote-debugging-port=9223', `--user-data-dir=${userDataPath}`],
  16  |   env: {
  17  |     ...process.env,
  18  |     NODE_ENV: 'development',
  19  |     SMOKE_TEST: 'true',
  20  |     NODE_OPTIONS: '',
  21  |   }
  22  | });
  23  | 
  24  | app.process().stdout?.on('data', (data) => console.log(`[Electron Stdout]: ${data}`));
  25  | app.process().stderr?.on('data', (data) => console.error(`[Electron Stderr]: ${data}`));
  26  | 
  27  | window = await app.firstWindow();
  28  |     await window.waitForLoadState('domcontentloaded');
  29  |   });
  30  | 
  31  |   test.afterAll(async () => {
  32  |     if (app) await app.close();
  33  |     if (fs.existsSync(userDataPath)) {
  34  |       try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (_err) {
  35  |         // Ignore errors during cleanup
  36  |       }
  37  |     }
  38  |   });
  39  | 
  40  |   test('Full registration and login flow', async () => {
  41  |     console.log('🚀 Starting Smoke Test...');
  42  | 
  43  |     // Wait for initial load
  44  |     await window.waitForSelector('input', { timeout: 20000 });
  45  |     
  46  |     const timestamp = Date.now();
  47  |     const uniqueUsername = `smoke_${timestamp}`;
  48  |     const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
  49  |     const password = 'SmokeTestPassword123!';
  50  | 
  51  |     console.log(`👤 Step 1: Trying to login with non-existent user (${uniqueUsername})`);
  52  |     await window.locator('#auth-username').fill(uniqueUsername);
  53  |     const loginPassInput = window.locator('#auth-password');
  54  |     await loginPassInput.fill(password);
  55  |     await window.locator('button[type="submit"]').click();
  56  | 
  57  |     // Expect an error (the UI should show an error message)
  58  |     // Give it a moment to show the error
  59  |     await window.waitForTimeout(1000);
  60  | 
  61  |     console.log('📝 Switching to Register Mode...');
  62  |     await window.locator('.auth-switch__button').nth(1).click();
  63  | 
  64  |     console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
  65  |     await window.locator('#register-email').fill(uniqueEmail);
  66  |     await window.locator('#auth-username').fill(uniqueUsername);
  67  |     await window.locator('button[type="submit"]').click();
  68  | 
  69  |     console.log('🔑 Step 3: Filling passwords...');
  70  |     const passInput = window.locator('#auth-password');
> 71  |     await passInput.waitFor({ state: 'visible' });
      |                     ^ TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
  72  |     await passInput.fill(password);
  73  |     await window.locator('#auth-password-confirm').fill(password);
  74  |     
  75  |     console.log('📡 Submitting registration form...');
  76  |     
  77  |     // Set up a promise to catch the stdout code before clicking submit
  78  |     const codePromise = new Promise<string>((resolve) => {
  79  |       const onData = (data: Buffer) => {
  80  |         const line = data.toString();
  81  |         const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
  82  |         if (match) {
  83  |           app.process().stdout.off('data', onData);
  84  |           resolve(match[1]);
  85  |         }
  86  |       };
  87  |       app.process().stdout.on('data', onData);
  88  |       
  89  |       // Safety timeout
  90  |       setTimeout(() => {
  91  |         app.process().stdout.off('data', onData);
  92  |         resolve('');
  93  |       }, 15000);
  94  |     });
  95  | 
  96  |     await window.locator('button[type="submit"]').click();
  97  | 
  98  |     console.log('📧 Waiting for Verification Screen...');
  99  |     const codeInput = window.locator('#email-code');
  100 |     try {
  101 |       await codeInput.waitFor({ state: 'visible', timeout: 30000 });
  102 |     } catch (e) {
  103 |       console.error('Timeout waiting for email code input.');
  104 |       const errorText = await window.locator('[role="alert"]').textContent().catch(() => null);
  105 |       if (errorText) {
  106 |         console.error(`UI Error Message: ${errorText}`);
  107 |       } else {
  108 |         console.error('No UI Error Message found.');
  109 |       }
  110 |       throw e;
  111 |     }
  112 | 
  113 |     console.log('🔍 Waiting for intercepted test code...');
  114 |     let finalVerificationCode = await codePromise;
  115 | 
  116 |     if (!finalVerificationCode) {
  117 |       console.log('🔄 Fallback: fetching code via evaluate');
  118 |       finalVerificationCode = await window.evaluate(() => (global as unknown as Record<string, unknown>).lastDevelopmentCode as string || '');
  119 |     }
  120 | 
  121 |     if (!finalVerificationCode) {
  122 |       throw new Error('Could not intercept verification code from stdout.');
  123 |     }
  124 | 
  125 |     console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
  126 |     console.log(`🔘 Entering code: ${finalVerificationCode}`);
  127 |     await codeInput.fill(finalVerificationCode);
  128 |     await window.locator('button[type="submit"]').click();
  129 | 
  130 |     console.log('🏠 Waiting for Dashboard...');
  131 |     await window.waitForSelector('main', { timeout: 20000 });
  132 |     
  133 |     const isDashboardVisible = await window.locator('main').isVisible();
  134 |     expect(isDashboardVisible).toBe(true);
  135 |     console.log('✨ SUCCESS: Dashboard reached!');
  136 | 
  137 |     // Cleanup
  138 |     console.log(`🧹 Cleaning up test user...`);
  139 |     const cleanupResult = await window.evaluate(async () => {
  140 |       const electronAPI = (window as unknown as { electronAPI: { auth: { getSession: () => Promise<{ user: { id: string } }> }, admin: { deleteTestUser: (id: string) => Promise<{ success: boolean, error?: string }> } } }).electronAPI;
  141 |       const session = await electronAPI.auth.getSession();
  142 |       if (session.user?.id) {
  143 |         return await electronAPI.admin.deleteTestUser(session.user.id);
  144 |       }
  145 |       return { success: false, error: 'No user ID found' };
  146 |     });
  147 | 
  148 |     if (cleanupResult.success) {
  149 |       console.log('✅ Test user deleted successfully.');
  150 |     } else {
  151 |       console.warn(`⚠️ Failed to delete test user: ${cleanupResult.error}`);
  152 |     }
  153 |   });
  154 | });
  155 | 
```