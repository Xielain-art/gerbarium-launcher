# Distribution Updater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build manifest-based modpack update/repair before Minecraft launch.

**Architecture:** Add typed distribution manifest models in shared code, a main-process updater service, IPC handlers exposed through preload, and a static browser manifest builder. Keep MCLC launch unchanged except running update before launch from renderer.

**Tech Stack:** Electron main IPC, TypeScript, Node `fs/promises`, Node `crypto`, `got`, browser File System Access API, Web Crypto.

---

### Task 1: Shared Contract

**Files:**
- Create: `src/shared/distribution/manifest.ts`
- Modify: `src/shared/constants/ipc/channels.ts`
- Modify: `src/shared/constants/ipc/models.ts`
- Modify: `src/shared/constants/ipc/map.ts`

- [ ] Add manifest types with `sync`, `seed`, and `ignore` actions.
- [ ] Add `game:update` and `game:verify` IPC entries.
- [ ] Add update option/result types.

### Task 2: Main Updater

**Files:**
- Create: `src/main/services/gameDistributionUpdater.ts`
- Create: `src/main/handlers/game/update.ts`
- Modify: `src/main/handlers/gameHandler.ts`
- Modify: `src/shared/constants/log-messages.ts`

- [ ] Fetch manifest by URL.
- [ ] Validate safe relative paths.
- [ ] Hash local files with SHA-256.
- [ ] Download missing/changed files.
- [ ] Delete only manifest-listed obsolete files.
- [ ] Emit progress on existing game progress IPC channel.

### Task 3: Preload And Renderer

**Files:**
- Modify: `src/preload/preload.ts`
- Modify: `src/renderer/electron.d.ts`
- Modify: `src/renderer/src/hooks/useDashboardScreen.ts`

- [ ] Expose `window.electronAPI.game.update` and `verify`.
- [ ] Run update before `game.launch`.
- [ ] Show update status through existing launch status/progress state.

### Task 4: Static Manifest Builder

**Files:**
- Create: `tools/distribution-builder/index.html`
- Create: `tools/distribution-builder/style.css`
- Create: `tools/distribution-builder/app.js`
- Create: `tools/distribution-builder/README.md`

- [ ] Let admin select an ideal modpack folder.
- [ ] Compute SHA-256 and file sizes in browser.
- [ ] Auto-classify actions by path.
- [ ] Export `distribution.json`.

### Task 5: Backend Requirements

**Files:**
- Create: `docs/backend-distribution-requirements.md`

- [ ] Document DB metadata versus object storage files.
- [ ] Document API endpoints.
- [ ] Document config file policy.

### Task 6: Verification

**Commands:**
- `npm run build`
- `npx eslint src/main src/preload src/shared src/renderer/src/hooks/useDashboardScreen.ts --max-warnings=0`

