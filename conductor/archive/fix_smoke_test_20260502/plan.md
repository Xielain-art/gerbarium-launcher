# Implementation Plan: Fix Smoke Test Registration Flow

## Phase 1: Investigate and Fix Test Flow
- [x] Task: Analyze Registration Flow Changes [d7ad2fc]
    - [x] Review recent changes to `src/main/handlers/authHandler.ts` or related auth handlers to understand expected UI flow.
    - [x] Run the application locally and perform the registration flow manually to observe the UI steps and timings.
- [x] Task: Update Smoke Test Logic [9c180a7]
    - [x] Modify `tests/smoke.spec.ts` around line 67 to correctly wait for the transition to the password input screen.
    - [x] Add appropriate assertions or wait conditions (e.g., waiting for specific network requests or DOM elements) before trying to fill the `#auth-password` field.
- [x] Task: Verify Smoke Test Fix [7d7fb10]
    - [x] Run `npm run test:smoke` to confirm the test executes successfully from start to finish without hanging.
    - [x] Ensure cleanup steps at the end of the test execute correctly.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Investigate and Fix Test Flow' (Protocol in workflow.md) [7d7fb10]