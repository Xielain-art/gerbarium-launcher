# Gerbarium Launcher - Project Rules & Guidelines

This is an Electron-based game launcher monorepo using React (Vite) and TypeScript. 
Strict adherence to architectural boundaries, type safety, and project-specific build rules is mandatory.

## 📁 Project Structure & Key Directories

- **Entrypoint:** `index.js` (loads compiled handlers from `dist/main/handlers/`).
- `src/main/` — Electron Main Process code. Handles OS-level operations, file system, and heavy tasks.
  - `src/main/handlers/` — Main IPC handlers (compiles to `dist/main/handlers/`).
- `src/preload/` — Preload scripts. Secure bridge between Main and Renderer via `contextBridge`.
- `src/renderer/` — Frontend application (React, Vite, Zustand). STRICTLY NO direct Node.js access!
- `src/shared/` — Shared files, types, and constants (IPC channels, error codes).
- `dist/` — Build artifacts. **Do not edit directly.**
- `_legacy_app/` — DEPRECATED. Use only as a reference; do not modify or extract patterns from here.

## 🛠 Build & Development Commands

- **Dev:** `npm run dev` — Concurrent dev (Vite UI, esbuild watch for main/preload, electron).
- **Build:** `npm run build` — Production build (Vite UI, esbuild main/preload).
- **Build Quirk (CRITICAL):** `build:main` / `dev:main` scripts MUST include the `--external:electron-log` flag. This prevents bundling `electron-log`, which causes duplicate IPC handler errors for `__ELECTRON_LOG__`.
- **Transpilation:** There is no `tsc` build step. `esbuild` transpiles TS for main/preload directly.

## 🏗 Core Development Standards

### 1. Inter-Process Communication (Strict IPC) - CRITICAL
- **NO "Magic Strings":** Never use hardcoded strings for IPC events and LOGS AND ERRORS (e.g., `ipcMain.handle('my-event')`).
- **Channel Registry:** ALL events must be added to the `IPC_CHANNELS` constant and strongly typed within the `IpcChannelMap` interface inside `src/shared/constants/ipc-chanels.ts`. Update both simultaneously.
- **Preload Isolation:** In `src/preload/preload.ts`, only invoke methods defined in `IpcChannelMap` using the `typedInvoke` wrapper.
- **Renderer API:** All renderer APIs must be exposed via `window.electronAPI`. Do not attach random methods to the global `window` object.

### 2. Main Process (Electron)
- **Never Block the Main Thread:** Do not use synchronous methods for file system operations or archiving (e.g., `fs.readFileSync`, `zip.writeZip`). Strictly use asynchronous alternatives (e.g., `fs.promises`, `writeZipPromise` or streams).
- **Logging:** Use `electron-log` exclusively (never `console.log`). Logs are written to `app.getPath('userData')/logs`.
- **Error Handling:** `try/catch` blocks are mandatory. Handlers must gracefully return a standardized object: `{ success: false, error: string }`.
  - *Java Handlers:* Must strictly use error codes defined in `src/shared/constants/errors.ts` (no hardcoded error strings).
- **User Prompts:** Never save files to user directories (like Desktop) silently. Always use `dialog.showSaveDialog` or `dialog.showOpenDialog`.

### 3. Frontend Process (React Renderer)
- **State Management:** Use `Zustand` (located in `src/renderer/src/stores/`). Do not use Redux or default to React Context API for global state.
- **Component Architecture:** Use React functional components and hooks. Maintain separation between UI (`src/renderer/src/components/ui/`) and business logic (`src/renderer/src/components/game/`, `src/renderer/src/pages/`).
- **Node Integration:** `nodeIntegration` is disabled, and `contextIsolation` is enabled. Never attempt to import `fs`, `path`, or `child_process` directly inside React components.

### 4. TypeScript Typing
- Strict mode is enabled. The use of `any` is strictly prohibited (use `unknown` or define proper interfaces).
- Data payloads passed between Main and Renderer must be explicitly typed in the `src/shared/` directory.

## 📦 Dependencies Notes
- **Archiving:** For log exporting or zipping, rely on `archiver` + `@types/archiver` (ensure it is installed via `npm install` in `package.json` if missing). Do not use synchronous zipper libraries.