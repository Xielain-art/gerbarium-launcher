# Implementation Plan: Fix Release Target Repository in Pipeline

## Phase 1: Update Pipeline Release Job
- [ ] Task: Modify Release Action Configuration
    - [ ] Edit `.github/workflows/pipeline.yml`.
    - [ ] In the `Create GitHub Release` step, add the `repository` parameter pointing to `Xielain-art/gerbarium-releases`.
    - [ ] In the `Create GitHub Release` step, change `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` to `GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}` so the action has cross-repository write permissions.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Update Pipeline Release Job' (Protocol in workflow.md)