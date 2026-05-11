# Update and Modpack Flow (Current State)

This document describes how launcher update checks, integrity checks, and game distribution (modpack) updates currently work.

## 1) Startup Flow

Entry point in renderer routing:
- `/` -> `IntegrityCheckScreen`
- `/update` -> `UpdateScreen`

Main startup sequence in `IntegrityCheckScreen`:
1. Splash/video starts.
2. `window.electronAPI.verifyIntegrity()` is called.
3. After integrity check, update flow is started from the same screen:
   - subscribe to `onUpdateMessage`, `onUpdateInfo`, `onUpdateProgress`
   - call `initUpdate()` then `startUpdateCheck()`
4. If updater says "no update", startup gate is opened and app navigates to login.
5. If update is downloaded, main process restarts app via `quitAndInstall()`.

Relevant files:
- `src/renderer/src/hooks/useIntegrityCheckScreen.ts`
- `src/renderer/src/router.tsx`
- `src/main/handlers/update/events.ts`
- `src/main/handlers/update/commands.ts`

## 2) Electron Auto-Update Flow

Main process wiring:
- `src/main/handlers/update/service.ts` registers events and IPC commands.
- `events.ts` binds `autoUpdater` lifecycle events.
- `commands.ts` starts manual checks and exposes download/install commands.

Current behavior:
- `autoUpdater.autoDownload = false`
- On `update-available`, code immediately calls `autoUpdater.downloadUpdate()`.
- Progress and status are sent to renderer via:
  - `update-message`
  - `update-progress`
  - `update-info`
- On `update-downloaded`, app calls `quitAndInstall()` after timeout.

## 3) Modpack (Distribution) Update Flow

Distribution update is separate from launcher binary update.

Renderer side (`Dashboard` launch button):
1. User clicks Play.
2. Before Minecraft launch, renderer calls:
   - `window.electronAPI.game.update({ gamePath, minecraftVersion, manifestUrl })`
3. If update succeeds, renderer starts `game.launch(...)`.

Main side:
- IPC handler `GAME.UPDATE` and `GAME.VERIFY` in:
  - `src/main/handlers/game/update.ts`
- Real update logic in:
  - `src/main/services/gameDistributionUpdater.ts`

`runDistributionUpdate(...)` does:
1. Resolve pack URL from `PACKWIZ_PACK_URL`.
2. Download and validate manifest schema.
3. For each managed file:
   - normalize/sanitize path
   - skip never-managed paths (`saves`, `screenshots`, `logs`, `crash-reports`)
   - compare local SHA-256
   - if mismatch and not `verifyOnly`, download and verify hash
4. Optionally delete obsolete files from `manifest.delete`.
5. Return summary: checked/downloaded/skipped/deleted.

Progress:
- Main emits game progress events via `IPC_CHANNELS.GAME.PROGRESS`.
- Renderer (`useDashboardScreen`) listens and updates launch progress/status/logs.

## 4) Minecraft Launch Flow

File: `src/main/handlers/game/launch.ts`

Key steps:
1. Validate username/version/memory/java path.
2. Resolve instance root path.
3. Optional:
   - Forge installer download/cache
   - Fabric profile fetch/generation
4. Launch via `minecraft-launcher-core`.
5. Stream launch data/progress/errors back through `game:progress`.

Renderer side consumer:
- `src/renderer/src/hooks/useDashboardScreen.ts`

## 5) Dead Code / Legacy Candidates (Observed)

These are candidates, not removed in this document.

1. `update-init` IPC channel appears unused on main side.
- Used in preload: `initUpdate()`
- No `ipcMain.on/handle(IPC_CHANNELS.UPDATE.INIT, ...)` found in main.

2. Manual update commands likely unused by renderer:
- `downloadUpdate()` and `installUpdateAndRestart()` are exposed in preload.
- No renderer usages found.
- Actual flow downloads automatically in `events.ts` on `update-available`.

3. `useUpdateScreen` duplicates update flow logic already handled in `useIntegrityCheckScreen`.
- Both screens perform update checks and listen update events.
- Route guard still references `/update`, but normal startup path begins at `/`.

4. `useDownloadStore` contains mock download pipeline (`startDownload`, `updateProgress`, `resetDownload`).
- Current modpack flow uses `window.electronAPI.game.update(...)` in dashboard hook.
- No usages found for these mock actions.

## 6) Safe Refactor Plan (Suggested)

1. Remove or wire `UPDATE.INIT` properly.
2. Decide single source of truth for update UI flow:
   - keep only IntegrityCheck-driven flow, or
   - keep dedicated UpdateScreen flow.
3. Remove unused preload methods if renderer never calls them.
4. Replace/mock-clean `useDownloadStore` actions that are not used.
5. Move all user-facing strings from `ui-strings.ts` to locale-based translations (current file still contains mojibake text).

