# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Test - Full Auth Flow >> Full registration and login flow
- Location: tests/smoke.spec.ts:34:7

# Error details

```
Error: Process failed to launch!
```

```
Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:60300
Call log:
  - <launching> /mnt/e/gerbarium-launcher/node_modules/electron/dist/electron.exe -r /mnt/e/gerbarium-launcher/node_modules/playwright-core/lib/server/electron/loader.js --inspect=0 --remote-debugging-port=0 . --no-sandbox --user-data-dir=/mnt/e/gerbarium-launcher/test-user-data
  - <launched> pid=4079
  - [pid=4079][out]
  - [pid=4079][err] Debugger listening on ws://127.0.0.1:60300/602db5ae-a20b-466b-873a-69ccfed50ec9
  - [pid=4079][err] For help, see: https://nodejs.org/en/docs/inspector
  - <ws connecting> ws://127.0.0.1:60300/602db5ae-a20b-466b-873a-69ccfed50ec9
  - <ws error> ws://127.0.0.1:60300/602db5ae-a20b-466b-873a-69ccfed50ec9 error connect ECONNREFUSED 127.0.0.1:60300
  - <ws connect error> ws://127.0.0.1:60300/602db5ae-a20b-466b-873a-69ccfed50ec9 connect ECONNREFUSED 127.0.0.1:60300
  - <ws disconnected> ws://127.0.0.1:60300/602db5ae-a20b-466b-873a-69ccfed50ec9 code=1006 reason=
  - [pid=4079] <kill>
  - [pid=4079] <will force kill>
  - [pid=4079] <process did exit: exitCode=null, signal=SIGKILL>
  - [pid=4079] starting temporary directories cleanup
  - [pid=4079] finished temporary directories cleanup

```

# Test source

```ts
  1   | import { test, expect, _electron as electron } from '@playwright/test';
  2   | import path from 'path';
  3   | import fs from 'fs';
  4   | 
  5   | test.describe('Smoke Test - Full Auth Flow', () => {
  6   |   let app: any;
  7   |   let window: any;
  8   |   const userDataPath = path.join(process.cwd(), 'test-user-data');
  9   | 
  10  |   test.beforeAll(async () => {
  11  |     if (fs.existsSync(userDataPath)) {
  12  |       fs.rmSync(userDataPath, { recursive: true, force: true });
  13  |     }
  14  | 
> 15  |     app = await electron.launch({
      |           ^ Error: electron.launch: WebSocket error: connect ECONNREFUSED 127.0.0.1:60300
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
  30  |       try { fs.rmSync(userDataPath, { recursive: true, force: true }); } catch (e) {}
  31  |     }
  32  |   });
  33  | 
  34  |   test('Full registration and login flow', async () => {
  35  |     console.log('🚀 Starting Smoke Test...');
  36  | 
  37  |     // Listen for code in stdout
  38  |     let interceptedCode = '';
  39  |     app.process().stdout.on('data', (data: Buffer) => {
  40  |       const line = data.toString();
  41  | 
  42  |       // Catch our custom debug log from auth.ts
  43  |       if (line.includes('[DEBUG_API_')) {
  44  |         console.log(`📡 RAW API DATA: ${line.trim()}`);
  45  |       }
  46  | 
  47  |       // Catch the code from authHandler.ts
  48  |       const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
  49  |       if (match) {
  50  |         interceptedCode = match[1];
  51  |         console.log(`📡 Intercepted code from stdout: ${interceptedCode}`);
  52  |       }
  53  |     });
  54  | 
  55  |     app.process().stderr.on('data', (data: Buffer) => {
  56  |       console.error(`[APP_STDERR] ${data.toString().trim()}`);
  57  |     });
  58  | 
  59  |     // Wait for initial load
  60  |     await window.waitForSelector('input', { timeout: 20000 });
  61  |     
  62  |     const timestamp = Date.now();
  63  |     const uniqueUsername = `smoke_${timestamp}`;
  64  |     const uniqueEmail = `smoke_${timestamp}@gerbarium.ru`;
  65  |     const password = 'SmokeTestPassword123!';
  66  | 
  67  |     console.log('📝 Switching to Register Mode...');
  68  |     await window.locator('.auth-switch__button').nth(1).click();
  69  | 
  70  |     console.log(`👤 Step 1: Filling account details (${uniqueUsername})`);
  71  |     await window.locator('#register-email').fill(uniqueEmail);
  72  |     await window.locator('#auth-username').fill(uniqueUsername);
  73  |     await window.locator('button[type="submit"]').click();
  74  | 
  75  |     console.log('🔑 Step 2: Filling passwords...');
  76  |     const passInput = window.locator('#auth-password');
  77  |     await passInput.waitFor({ state: 'visible' });
  78  |     await passInput.fill(password);
  79  |     await window.locator('#auth-password-confirm').fill(password);
  80  |     
  81  |     console.log('📡 Submitting registration form...');
  82  |     await window.locator('button[type="submit"]').click();
  83  | 
  84  |     console.log('📧 Waiting for Verification Screen...');
  85  |     const codeInput = window.locator('#email-code');
  86  |     await codeInput.waitFor({ state: 'visible', timeout: 15000 });
  87  | 
  88  |     console.log('🔍 Searching for development code...');
  89  |     
  90  |     let code = interceptedCode;
  91  |     
  92  |     // Fallback: manually trigger status check via Electron IPC to get developmentCode
  93  |     if (!code) {
  94  |       console.log('📡 Manually requesting verification status check...');
  95  |       try {
  96  |         const result = await window.evaluate(async () => {
  97  |           // Trigger the IPC handler via the exposed electronAPI in renderer process
  98  |           return await (window as any).electronAPI.auth.getEmailVerificationStatus();
  99  |         });
  100 |         
  101 |         if (result && result.success && result.emailVerification?.developmentCode) {
  102 |           code = result.emailVerification.developmentCode;
  103 |           console.log(`📡 Obtained code via manual check: ${code}`);
  104 |         }
  105 |       } catch (e) {
  106 |         console.error(`❌ Failed to manually request status check: ${e}`);
  107 |       }
  108 |       
  109 |       if (!code) {
  110 |         console.log('🔄 Checking global state as secondary fallback...');
  111 |         for (let i = 0; i < 10; i++) {
  112 |           code = await app.evaluate(() => (global as any).lastDevelopmentCode);
  113 |           if (code) break;
  114 |           await new Promise(r => setTimeout(r, 500));
  115 |         }
```