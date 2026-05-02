# Implementation Plan: Fix GitHub Actions CI/CD Issues

## Phase 1: Fix Windows Smoke Test
- [ ] Task: Update Windows Workflow
    - [ ] Edit `.github/workflows/build-windows.yml` to uncomment the `npm run test:smoke` step.
    - [ ] Add a preceding step to install Playwright browsers (`npx playwright install chromium`) to ensure the runner has the necessary environment.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Fix Windows Smoke Test' (Protocol in workflow.md)

## Phase 2: Unify Release Process
- [ ] Task: Remove OS-specific Publishing
    - [ ] Edit `build-windows.yml`, `build.yml` (Linux), and `build-macos.yml` to remove the `npm run publish-app` steps.
    - [ ] Ensure that the `actions/upload-artifact` steps remain in all workflows so that the built binaries are preserved.
- [ ] Task: Create Unified Release Workflow
    - [ ] In order to reliably download artifacts and create a single release, consolidate the release logic. (e.g., Create a single `release.yml` that handles the build matrix and publishing, or configure a `workflow_run` trigger).
    - [ ] Implement a job that downloads all `gerbarium-windows`, `gerbarium-linux`, and `gerbarium-macos` artifacts and uses `softprops/action-gh-release` to create the draft release.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Unify Release Process' (Protocol in workflow.md)