# Gerbarium Launcher - Project Rules & Guidelines

This is an Electron-based game launcher monorepo using React (Vite) and TypeScript. 
Strict adherence to architectural boundaries, type safety, and project-specific build rules is mandatory.

## 📁 Project Structure & Key Directories

- **Entrypoint:** `index.js` (loads compiled handlers from `dist/main/handlers/`).
- `src/main/` — Electron Main Process code. Handles OS-level operations, file system, and heavy tasks.
  - `src/main/handlers/` — Main IPC handlers (compiles to `dist/main/handlers/`).
- `src/preload/` — Preload scripts. Secure bridge between Main and Renderer via `contextBridge`.
- `src/renderer/` — Frontend application (React, Vite, Zustand, TanStack Query). STRICTLY NO direct Node.js access!
- `src/lib/api/` — Core API layer. Contains all API interaction logic, service functions, and fetchers.
  - `v1.d.ts` — **The Full API Structure.** This is the primary source of truth for all API-related types and schemas.
- `src/shared/` — Shared files, types, and constants (IPC channels, error codes).
- `dist/` — Build artifacts. **Do not edit directly.**

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
- **State Management (Client vs. Server):** - **Client State:** Use `Zustand` (located in `src/renderer/src/stores/`) strictly for local UI state (e.g., toggles, modals, current view). Do not use Redux or default to React Context API for global state.
  - **Server State:** For fetching external data, caching, and background synchronization, ALWAYS use `TanStack Query` when it is safe to do so. Never store API responses inside Zustand.
- **TanStack Query Architecture (Best Practices):**
  - **Query Options Factory:** Utilize `queryOptions` from TanStack v5 to centralize query keys (`queryKey`) and fetching logic (`queryFn`). This ensures type safety and reusable prefetch logic.
  - **Query Key Factories:** Query keys must be generated via factory objects, never hardcoded as strings directly in components.
  - **Isolation of API:** Data fetching functions must be strictly isolated within the `src/lib/api/` layer and remain independent of React Query hooks.
  - **Mutations:** Always handle cache updates gracefully. Use `useMutation` and mandate the invalidation of related query keys inside `onSuccess` using `queryClient.invalidateQueries`.
- **Component Architecture ("Thin" Components):** - **Keep Components less than 150 lines of code:** React components must be strictly focused on rendering UI. Components should not be "fat" with logic. 
  - **Extract Logic:** All business logic, complex state management, data transformation, and side effects MUST be extracted into custom hooks.
  - **Separation of Concerns:** Maintain a strict separation between dumb UI components (`src/renderer/src/components/ui/`) and business logic wrappers/pages (`src/renderer/src/components/game/`, `src/renderer/src/pages/`).
- **Node Integration:** `nodeIntegration` is disabled, and `contextIsolation` is enabled. Never attempt to import `fs`, `path`, or `child_process` directly inside React components.

### 4. TypeScript Typing
- **Strict Typing:** Strict mode is enabled. The use of `any` is strictly prohibited (use `unknown` or define proper interfaces).
- **API Types:** All API-related types and data structures must be derived from or defined in `src/lib/api/v1.d.ts`.
- **Shared Payloads:** Data payloads passed between Main and Renderer must be explicitly typed in the `src/shared/` directory.

## 📦 Dependencies Notes
- **Archiving:** For log exporting or zipping, rely on `archiver` + `@types/archiver`. Do not use synchronous zipper libraries.
- **Server State:** For server state management, always use `@tanstack/react-query`. Strictly follow the `queryOptions` factory pattern and ensure all fetchers are located in `src/lib/api/`.

## 📦 Packwiz Modpack Policy
- Launcher client modpack updates MUST use **packwiz** (`pack.toml` + `index.toml` + `*.pw.toml`) as source of truth.
- CurseForge manifest is **not** the primary runtime format for launcher updates.
- Custom/private Gerbarium mods must be supported via direct HTTPS URLs in packwiz metadata.
- Hash verification is mandatory for downloaded files (minimum `sha256` support).
- Server-only mods (`side = "server"`) must never be installed into client instance.
- Stale cleanup must be conservative (no blind full-folder deletion).
- Documentation for packwiz flow must be kept up to date in `docs/packwiz-launcher-updates.md`.
