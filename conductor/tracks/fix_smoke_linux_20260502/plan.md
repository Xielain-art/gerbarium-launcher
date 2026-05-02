# Implementation Plan: Fix smoke test failure on Linux in GitHub Actions

## Phase 1: Investigation and Reproduction
- [ ] Task: Research - Analyze `tests/smoke.spec.ts` and GH Actions configuration
    - [ ] Review `tests/smoke.spec.ts` around line 97
    - [ ] Examine `.github/workflows/` files for Linux-specific environment setup
    - [ ] Check `src/renderer/src/pages/LoginScreen.tsx` or equivalent for registration logic
- [ ] Task: Reproduction - Attempt to reproduce the failure in a controlled Linux environment
    - [ ] Run smoke tests in a Linux container if possible
    - [ ] Add extra logging to `tests/smoke.spec.ts` to capture UI state before timeout
- [ ] Task: Conductor - User Manual Verification 'Investigation and Reproduction' (Protocol in workflow.md)

## Phase 2: Implementation and Fix
- [ ] Task: Fix - Address root cause of registration failure or UI transition delay
    - [ ] Write failing test (if applicable) or enhanced smoke test to catch the race condition
    - [ ] Apply fix to application code or test script
- [ ] Task: Verification - Confirm fix resolves the timeout locally in Linux
- [ ] Task: Conductor - User Manual Verification 'Implementation and Fix' (Protocol in workflow.md)

## Phase 3: CI Integration and Final Check
- [ ] Task: CI Test - Verify fix in GitHub Actions
    - [ ] Push changes and monitor GH Actions run
- [ ] Task: Conductor - User Manual Verification 'CI Integration and Final Check' (Protocol in workflow.md)