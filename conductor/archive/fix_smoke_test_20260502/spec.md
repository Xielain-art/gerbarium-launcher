# Specification: Fix Smoke Test Registration Flow

## Overview
The automated smoke test (`test:smoke`) is currently hanging during the "Full registration and login flow". Specifically, it stalls at Step 3 ("Filling passwords...") because the `#auth-password` field never becomes visible after submitting the initial registration details (email and username). The user manually closed the window, causing the `Target page, context or browser has been closed` error. This issue only affects the test execution; manual registration works correctly.

## Functional Requirements
- Investigate the test logic in `tests/smoke.spec.ts` around the registration flow.
- Identify why the transition from the first registration screen to the password input screen is failing or timing out during the automated test.
- Update the test assertions, waits, or interaction steps to properly navigate the registration UI as it currently exists.
- Ensure the full `test:smoke` suite passes without manual intervention.

## Out of Scope
- Modifying the application's core registration logic (the bug is identified as test-only).
- Changing the underlying authentication handlers.

## Acceptance Criteria
- `npm run test:smoke` executes successfully from start to finish.
- The "Full registration and login flow" test passes without hanging.