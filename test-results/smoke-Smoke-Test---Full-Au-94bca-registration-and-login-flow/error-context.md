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
  - waiting for locator('#email-code') to be visible

```

# Test source

```ts
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
  91  |     // Set up a promise to catch the stdout code before clicking submit
  92  |     const codePromise = new Promise<string>((resolve) => {
  93  |       const onData = (data: Buffer) => {
  94  |         const line = data.toString();
  95  |         const match = line.match(/\[SMOKE_TEST_CODE\]:(\d{6})/);
  96  |         if (match) {
  97  |           app.process().stdout.off('data', onData);
  98  |           resolve(match[1]);
  99  |         }
  100 |       };
  101 |       app.process().stdout.on('data', onData);
  102 |       
  103 |       // Safety timeout
  104 |       setTimeout(() => {
  105 |         app.process().stdout.off('data', onData);
  106 |         resolve('');
  107 |       }, 15000);
  108 |     });
  109 | 
  110 |     await window.locator('button[type="submit"]').click();
  111 | 
  112 |     console.log('📧 Waiting for Verification Screen...');
  113 |     const codeInput = window.locator('#email-code');
  114 |     try {
> 115 |       await codeInput.waitFor({ state: 'visible', timeout: 30000 });
      |                       ^ Error: locator.waitFor: Target page, context or browser has been closed
  116 |     } catch (e) {
  117 |       console.error('Timeout waiting for email code input.');
  118 |       const errorText = await window.locator('[role="alert"]').textContent().catch(() => null);
  119 |       if (errorText) {
  120 |         console.error(`UI Error Message: ${errorText}`);
  121 |       } else {
  122 |         console.error('No UI Error Message found.');
  123 |       }
  124 |       throw e;
  125 |     }
  126 | 
  127 |     console.log('🔍 Waiting for intercepted test code...');
  128 |     let finalVerificationCode = await codePromise;
  129 | 
  130 |     if (!finalVerificationCode) {
  131 |       const badgeText = await window
  132 |         .locator('text=/\\d{6}/')
  133 |         .first()
  134 |         .textContent()
  135 |         .catch(() => null);
  136 |       const badgeMatch = badgeText?.match(/(\d{6})/);
  137 |       finalVerificationCode = badgeMatch?.[1] || '';
  138 |     }
  139 | 
  140 |     if (!finalVerificationCode) {
  141 |       finalVerificationCode = await window.evaluate(async () => {
  142 |         const electronAPI = (window as unknown as {
  143 |           electronAPI: {
  144 |             auth: {
  145 |               getEmailVerificationStatus: () => Promise<{
  146 |                 success: boolean;
  147 |                 emailVerification?: { developmentCode?: string };
  148 |               }>;
  149 |             };
  150 |           };
  151 |         }).electronAPI;
  152 |         const status = await electronAPI.auth.getEmailVerificationStatus();
  153 |         return status.emailVerification?.developmentCode || '';
  154 |       });
  155 |     }
  156 | 
  157 |     if (!finalVerificationCode) {
  158 |       throw new Error('Could not resolve verification code.');
  159 |     }
  160 | 
  161 |     console.log(`✅ Test user registered. Code: ${finalVerificationCode}`);
  162 |     console.log(`🔘 Entering code: ${finalVerificationCode}`);
  163 |     await codeInput.fill(finalVerificationCode);
  164 |     await window.locator('button[type="submit"]').click();
  165 | 
  166 |     console.log('🏠 Waiting for Dashboard...');
  167 |     await window.waitForSelector('main', { timeout: 20000 });
  168 |     
  169 |     const isDashboardVisible = await window.locator('main').isVisible();
  170 |     expect(isDashboardVisible).toBe(true);
  171 |     console.log('✨ SUCCESS: Dashboard reached!');
  172 | 
  173 |     // Cleanup
  174 |     console.log(`🧹 Cleaning up test user...`);
  175 |     const cleanupResult = await window.evaluate(async () => {
  176 |       const electronAPI = (window as unknown as { electronAPI: { auth: { getSession: () => Promise<{ user: { id: string } }> }, admin: { deleteTestUser: (id: string) => Promise<{ success: boolean, error?: string }> } } }).electronAPI;
  177 |       const session = await electronAPI.auth.getSession();
  178 |       if (session.user?.id) {
  179 |         return await electronAPI.admin.deleteTestUser(session.user.id);
  180 |       }
  181 |       return { success: false, error: 'No user ID found' };
  182 |     });
  183 | 
  184 |     if (cleanupResult.success) {
  185 |       console.log('✅ Test user deleted successfully.');
  186 |     } else {
  187 |       console.warn(`⚠️ Failed to delete test user: ${cleanupResult.error}`);
  188 |     }
  189 |   });
  190 | });
  191 | 
  192 | 
```