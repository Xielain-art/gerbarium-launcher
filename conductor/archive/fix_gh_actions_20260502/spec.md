# Specification: Fix GitHub Actions CI/CD Issues

## Overview
Currently, the `test:smoke` suite is not running on the Windows GitHub Actions runner, and the release process creates duplicate draft releases when a new tag is pushed. This track addresses these CI/CD issues to ensure tests run across platforms and releases are unified.

## Functional Requirements
**1. Fix Windows Smoke Test:**
- Uncomment the smoke test step in `.github/workflows/build-windows.yml`.
- Add a step to install Playwright browsers (`npx playwright install --with-deps chromium` or similar) prior to running the smoke test to ensure the environment is correctly set up.

**2. Fix Duplicate Release Drafts:**
- Modify `build-windows.yml`, `build-linux.yml` (or `build.yml`), and `build-macos.yml` to remove the `npm run publish-app` step which uses `electron-builder`'s built-in publishing.
- Ensure all platform jobs upload their built binaries (e.g., `.exe`, `.AppImage`, `.dmg`) using `actions/upload-artifact`.
- Create a new unified release workflow or job (e.g., `release.yml` or a new job in the existing workflows) that triggers on tags, downloads all collected artifacts, and creates a single GitHub Release using a dedicated action (like `softprops/action-gh-release`).

## Out of Scope
- Modifying the actual source code or test logic of the application.
- Changing the build toolchain (we will continue to use Vite/esbuild/electron-builder).

## Acceptance Criteria
- Pushing to `master` or a PR triggers the Windows workflow and the smoke test executes successfully.
- Pushing a new tag (e.g., `v1.2.7`) creates exactly *one* release draft containing all platform assets (Windows, macOS, Linux).