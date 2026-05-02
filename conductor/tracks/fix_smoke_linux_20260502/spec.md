# Specification: Fix smoke test failure on Linux in GitHub Actions

## Problem Description
The `test:smoke` command fails in GitHub Actions on Linux environments. The logs indicate a `TimeoutError` in `tests/smoke.spec.ts` while waiting for the `#email-code` locator to become visible during the registration flow.

### Symptoms
- Timeout (30000ms exceeded) at `await codeInput.waitFor({ state: 'visible', timeout: 30000 });`
- Error context suggests registration failed or the UI didn't transition correctly to the verification screen.
- Issue is specific to Linux CI (works locally or on other platforms according to user).

## Goals
- Identify the root cause of the timeout in Linux CI.
- Ensure the registration flow works consistently in GitHub Actions.
- Fix any race conditions or environment-specific issues in the smoke test or application logic.

## Acceptance Criteria
- `npm run test:smoke` passes consistently on Linux in GitHub Actions.
- The registration flow correctly transitions to the verification screen and displays the email code input.
- Any necessary environment setup (e.g., xvfb, dependencies) for Linux CI is correctly configured.