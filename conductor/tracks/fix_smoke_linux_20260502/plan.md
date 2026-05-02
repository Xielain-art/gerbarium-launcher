# Implementation Plan: Fix smoke test failure on Linux in GitHub Actions

## Phase 1: Investigation and Reproduction
- [x] Task: Research - Analyze `tests/smoke.spec.ts` and GH Actions configuration [cef2d0f]
    - [x] Review `tests/smoke.spec.ts` around line 97
    - [x] Examine `.github/workflows/` files for Linux-specific environment setup
    - [x] Check `src/renderer/src/pages/LoginScreen.tsx` or equivalent for registration logic
- [ ] Task: Reproduction - Confirm safeStorage limitation in Linux CI
    - [ ] Create and run a minimal script to check `safeStorage.isEncryptionAvailable()` in xvfb
- [ ] Task: Conductor - User Manual Verification 'Investigation and Reproduction' (Protocol in workflow.md)

## Phase 2: Implementation and Fix
- [ ] Task: Fix - Implement safeStorage fallback for SMOKE_TEST mode
    - [ ] Add fallback to plain base64 in `src/main/handlers/authHandler.ts` if encryption is unavailable during SMOKE_TEST
    - [ ] Add similar fallback in `src/main/handlers/secureStorageHandler.ts`
- [ ] Task: Verification - Confirm smoke test passes with fallback
- [ ] Task: Conductor - User Manual Verification 'Implementation and Fix' (Protocol in workflow.md)

## Phase 3: CI Integration and Final Check
- [ ] Task: CI Test - Verify fix in GitHub Actions
    - [ ] Push changes and monitor GH Actions run
- [ ] Task: Conductor - User Manual Verification 'CI Integration and Final Check' (Protocol in workflow.md)