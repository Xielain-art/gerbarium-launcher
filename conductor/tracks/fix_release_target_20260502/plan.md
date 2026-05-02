# Implementation Plan: Fix Release Target Repository in Pipeline

## Phase 1: Update Pipeline Release Job
- [x] Task: Modify Release Action Configuration [0946321]
    - [x] Edit `.github/workflows/pipeline.yml`.
    - [x] In the `Create GitHub Release` step, add the `repository` parameter pointing to `Xielain-art/gerbarium-releases`.
    - [x] In the `Create GitHub Release` step, change `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` to `GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}` so the action has cross-repository write permissions.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Update Pipeline Release Job' (Protocol in workflow.md)