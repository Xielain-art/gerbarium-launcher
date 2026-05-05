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
Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:51734
Call log:
  - <launching> /mnt/c/Users/user/test/ggg/gerbarium-launcher/node_modules/electron/dist/electron.exe -r /mnt/c/Users/user/test/ggg/gerbarium-launcher/node_modules/playwright-core/lib/server/electron/loader.js --inspect=0 --remote-debugging-port=0 . --no-sandbox --user-data-dir=/mnt/c/Users/user/test/ggg/gerbarium-launcher/test-user-data
  - <launched> pid=3532
  - [pid=3532][out]
  - [pid=3532][err] Debugger listening on ws://127.0.0.1:51734/a7fdf7df-c704-4e05-a9ae-7a9bfb4d5305
  - [pid=3532][err] For help, see: https://nodejs.org/en/docs/inspector
  - <ws connecting> ws://127.0.0.1:51734/a7fdf7df-c704-4e05-a9ae-7a9bfb4d5305
  - <ws error> ws://127.0.0.1:51734/a7fdf7df-c704-4e05-a9ae-7a9bfb4d5305 error connect ECONNREFUSED 127.0.0.1:51734
  - <ws connect error> ws://127.0.0.1:51734/a7fdf7df-c704-4e05-a9ae-7a9bfb4d5305 connect ECONNREFUSED 127.0.0.1:51734
  - <ws disconnected> ws://127.0.0.1:51734/a7fdf7df-c704-4e05-a9ae-7a9bfb4d5305 code=1006 reason=
  - [pid=3532] <kill>
  - [pid=3532] <will force kill>
  - [pid=3532] <process did exit: exitCode=null, signal=SIGKILL>
  - [pid=3532] starting temporary directories cleanup
  - [pid=3532] finished temporary directories cleanup

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
> 14  |     app = await electron.launch({
      |           ^ Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:51734
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
  58  |     const registerModeButton = window.locator('.auth-switch__button').nth(1);
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
  79  |     await usernameInput.press('Enter');
  80  | 
  81  |     console.log('🔑 Step 3: Filling passwords...');
  82  |     const passInput = window.locator('#auth-password');
  83  |     await expect(passInput).toBeVisible({ timeout: 15000 });
  84  |     
  85  |     await passInput.fill(password);
  86  |     await window.locator('#auth-password-confirm').fill(password);
  87  |     
  88  |     console.log('📡 Submitting registration form...');
  89  |     
  90  |     // Set up a promise to catch the stdout code before clicking submit
  91  |     const codePromise = new Promise<string>((resolve) => {
  92  |       const onData = (data: Buffer) => {
  93  |         const line = data.toString();
  94  |         const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
  95  |         if (match) {
  96  |           app.process().stdout.off('data', onData);
  97  |           resolve(match[1]);
  98  |         }
  99  |       };
  100 |       app.process().stdout.on('data', onData);
  101 |       
  102 |       // Safety timeout
  103 |       setTimeout(() => {
  104 |         app.process().stdout.off('data', onData);
  105 |         resolve('');
  106 |       }, 15000);
  107 |     });
  108 | 
  109 |     await window.locator('button[type="submit"]').click();
  110 | 
  111 |     console.log('📧 Waiting for Verification Screen...');
  112 |     const codeInput = window.locator('#email-code');
  113 |     try {
  114 |       await codeInput.waitFor({ state: 'visible', timeout: 30000 });
```