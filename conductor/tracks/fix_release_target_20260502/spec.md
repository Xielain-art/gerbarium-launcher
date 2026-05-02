# Specification: Fix Release Target Repository in Pipeline

## Overview
The unified GitHub Actions pipeline (`pipeline.yml`) successfully builds artifacts but fails to create a release in the intended external repository (`Xielain-art/gerbarium-releases`). This is because the `softprops/action-gh-release` action defaults to the current repository and uses the default `GITHUB_TOKEN`, which lacks cross-repository permissions.

## Functional Requirements
- **Update Release Target:** Modify the `release` job in `.github/workflows/pipeline.yml` to explicitly target the correct repository (`Xielain-art/gerbarium-releases`).
- **Update Authentication Token:** Change the authentication token used in the release step from the default `GITHUB_TOKEN` to the custom secret `GH_TOKEN`, which has the necessary permissions to write to the external repository.

## Out of Scope
- Modifying the artifact build matrix (already working).
- Changing the `electron-builder.yml` configuration (already correct).

## Acceptance Criteria
- Pushing a new tag triggers the pipeline, which successfully creates exactly one draft release in `Xielain-art/gerbarium-releases` containing the compiled assets.