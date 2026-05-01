# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Test - Full Auth Flow >> Full registration and login flow
- Location: tests/smoke.spec.ts:36:7

# Error details

```
Error: Process failed to launch!
```

```
Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:58652
Call log:
  - <launching> /mnt/e/gerbarium-launcher/node_modules/electron/dist/electron.exe -r /mnt/e/gerbarium-launcher/node_modules/playwright-core/lib/server/electron/loader.js --inspect=0 --remote-debugging-port=0 . --no-sandbox --user-data-dir=/mnt/e/gerbarium-launcher/test-user-data
  - <launched> pid=4716
  - [pid=4716][out]
  - [pid=4716][err] Debugger listening on ws://127.0.0.1:58652/cd41b124-b0ba-4661-9a76-c5fb435e77c2
  - [pid=4716][err] For help, see: https://nodejs.org/en/docs/inspector
  - <ws connecting> ws://127.0.0.1:58652/cd41b124-b0ba-4661-9a76-c5fb435e77c2
  - <ws error> ws://127.0.0.1:58652/cd41b124-b0ba-4661-9a76-c5fb435e77c2 error connect ECONNREFUSED 127.0.0.1:58652
  - <ws connect error> ws://127.0.0.1:58652/cd41b124-b0ba-4661-9a76-c5fb435e77c2 connect ECONNREFUSED 127.0.0.1:58652
  - <ws disconnected> ws://127.0.0.1:58652/cd41b124-b0ba-4661-9a76-c5fb435e77c2 code=1006 reason=
  - [pid=4716] <kill>
  - [pid=4716] <will force kill>
  - [pid=4716] <process did exit: exitCode=null, signal=SIGKILL>
  - [pid=4716] starting temporary directories cleanup
  - [pid=4716] finished temporary directories cleanup

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
  14  | 
> 15  |     app = await electron.launch({
      |           ^ Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:58652
  16  |       args: ['.', '--no-sandbox', `--user-data-dir=${userDataPath}`],
  17  |       env: {
  18  |         ...process.env,
  19  |         NODE_ENV: 'development',
  20  |         SMOKE_TEST: 'true',
  21  |       }
  22  |     });
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
  58  |     await window.locator('.auth-switch__button').nth(1).click();
  59  | 
  60  |     console.log(`👤 Step 2: Filling registration details (${uniqueUsername})`);
  61  |     await window.locator('#register-email').fill(uniqueEmail);
  62  |     await window.locator('#auth-username').fill(uniqueUsername);
  63  |     await window.locator('button[type="submit"]').click();
  64  | 
  65  |     console.log('🔑 Step 3: Filling passwords...');
  66  |     const passInput = window.locator('#auth-password');
  67  |     await passInput.waitFor({ state: 'visible' });
  68  |     await passInput.fill(password);
  69  |     await window.locator('#auth-password-confirm').fill(password);
  70  |     
  71  |     console.log('📡 Submitting registration form...');
  72  |     
  73  |     // Set up a promise to catch the stdout code before clicking submit
  74  |     const codePromise = new Promise<string>((resolve) => {
  75  |       const onData = (data: Buffer) => {
  76  |         const line = data.toString();
  77  |         const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
  78  |         if (match) {
  79  |           app.process().stdout.off('data', onData);
  80  |           resolve(match[1]);
  81  |         }
  82  |       };
  83  |       app.process().stdout.on('data', onData);
  84  |       
  85  |       // Safety timeout
  86  |       setTimeout(() => {
  87  |         app.process().stdout.off('data', onData);
  88  |         resolve('');
  89  |       }, 15000);
  90  |     });
  91  | 
  92  |     await window.locator('button[type="submit"]').click();
  93  | 
  94  |     console.log('📧 Waiting for Verification Screen...');
  95  |     const codeInput = window.locator('#email-code');
  96  |     await codeInput.waitFor({ state: 'visible', timeout: 30000 });
  97  | 
  98  |     console.log('🔍 Waiting for intercepted test code...');
  99  |     let finalVerificationCode = await codePromise;
  100 | 
  101 |     if (!finalVerificationCode) {
  102 |       console.log('🔄 Fallback: fetching code via evaluate');
  103 |       finalVerificationCode = await window.evaluate(() => (global as unknown as Record<string, unknown>).lastDevelopmentCode as string || '');
  104 |     }
  105 | 
  106 |     if (!finalVerificationCode) {
  107 |       throw new Error('Could not intercept verification code from stdout.');
  108 |     }
  109 | 
  110 |     console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
  111 |     console.log(`🔘 Entering code: ${finalVerificationCode}`);
  112 |     await codeInput.fill(finalVerificationCode);
  113 |     await window.locator('button[type="submit"]').click();
  114 | 
  115 |     console.log('🏠 Waiting for Dashboard...');
```