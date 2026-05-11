# Security Best Practices Review Report

## Executive Summary
Security posture solid in core Electron isolation (`nodeIntegration: false`, `contextIsolation: true`) and IPC typing. Main risks found in supply-chain trust for modpack/runtime downloads and local secret-at-rest hardening. No direct renderer-to-Node RCE path found in reviewed code.

## High Severity

### SBP-001: Unpinned remote Forge installer download without integrity verification
- Severity: High
- Location: `src/main/handlers/game/launch.ts:69`, `src/main/handlers/game/launch.ts:76`, `src/main/handlers/game/launch.ts:95`, `src/main/handlers/game/launch.ts:212`
- Evidence:
  - `ensureForgeInstaller(..., forgeInstallerUrl?: string)` accepts URL from launch options.
  - Only checks `https` and `.jar`, then downloads and stores file.
  - No host allowlist, no hash/signature verification.
- Impact: If forge installer URL is attacker-controlled (compromised config/API or malicious actor with settings control), launcher can fetch and execute malicious Java payload during game setup.
- Fix:
  - Enforce strict host allowlist for installer URLs.
  - Require expected `sha256` (or stronger signature) and verify before use.
  - Prefer trusted static mapping (Minecraft/loader version -> known installer URL + hash), not arbitrary URL input.
- Mitigation:
  - Block custom installer URL in production builds.
  - Emit explicit warning when non-default source used.
- False positive notes: If `forgeInstallerUrl` is never user/server-controlled in production, risk decreases but remains latent design risk.

### SBP-002: Packwiz manifest and artifact sources are not origin-pinned
- Severity: High
- Location: `src/main/services/packwiz/updater.ts:48`, `src/main/services/packwiz/updater.ts:210`, `src/main/services/packwiz/updater.ts:276`, `src/main/services/packwiz/downloader.ts:85`, `src/main/services/packwiz/downloader.ts:106`
- Evidence:
  - `new URL(relativeOrAbsolute, base)` resolves absolute/relative remote URLs.
  - `fetchText`/`downloadToFile` fetch arbitrary URL provided by pack/index/metafile chain.
  - Hash check exists for files, but manifest/index source itself is not authenticated/pinned.
- Impact: MITM or compromised pack source can replace pack metadata and matching hashes, leading to trusted download of malicious mods/assets.
- Fix:
  - Enforce `https` only for all packwiz URLs.
  - Add source allowlist for pack/index/metafile/download domains.
  - Add signed manifest verification (detached signature/public key pinning) before trusting hashes.
- Mitigation:
  - Log and reject cross-origin jumps from trusted pack base by policy.
- False positive notes: If pack URL is fully controlled by trusted internal release pipeline + TLS pinning elsewhere, practical risk lower.

## Medium Severity

### SBP-003: Secure storage file written without explicit restrictive file permissions
- Severity: Medium
- Location: `src/main/handlers/auth/storage.ts:44`, `src/main/handlers/secureStorage/service.ts:37`
- Evidence:
  - Session data (tokens/session) is encrypted with `safeStorage` and written to JSON file.
  - `fs.writeFile(...)` uses default filesystem ACL/permissions; no explicit mode hardening.
- Impact: On misconfigured systems/profiles/backups, session ciphertext blob may be exposed more broadly than intended. Encryption reduces impact but does not eliminate metadata/leak risks.
- Fix:
  - Write file with restrictive mode where applicable (e.g. `0o600` on Unix).
  - Ensure parent directory inherits user-only ACL (especially Windows userData location checks).
- Mitigation:
  - Rotate/expire access tokens aggressively.
- False positive notes: On default Windows `%APPDATA%` ACL this is often user-scoped already; verify effective ACL at runtime/install targets.

## Low Severity

### SBP-004: DevTools can be opened from renderer IPC surface
- Severity: Low
- Location: `src/preload/api/window.ts:11`, `src/main/handlers/windowControlsHandler.ts:43`
- Evidence:
  - Renderer can invoke `openDevTools` via exposed preload API.
- Impact: In case of renderer XSS, attacker gains easier runtime introspection/debug tooling. Not direct privilege escalation.
- Fix:
  - Gate this channel by build flag (`isDev`/explicit debug mode) and disable in production.
- Mitigation:
  - Keep channel but protect behind trusted runtime setting only accessible locally.
- False positive notes: If product intentionally exposes DevTools to end users for support, keep as accepted risk.

## Positive Findings
- Electron isolation baseline present: `nodeIntegration: false`, `contextIsolation: true` (`src/main/runtime/window.ts`).
- External URL opening has hostname allowlist (`src/main/handlers/system/external.ts`).
- Path traversal defenses present in packwiz path normalization (`src/main/services/packwiz/updater.ts`).
- Markdown rendering uses DOMPurify sanitization before `dangerouslySetInnerHTML` (`src/renderer/src/lib/markdown.ts`).

## Recommended Next Actions
1. Fix SBP-001 first (highest direct code execution path).
2. Implement manifest signature/origin pinning for SBP-002.
3. Apply storage permission hardening for SBP-003.
4. Decide policy for production DevTools exposure (SBP-004).
