# Gerbarium Launcher

## Project Overview

Gerbarium Launcher (formerly HeliosLauncher/Electron Launcher) is an Electron-based desktop application designed as a custom Minecraft launcher for modded servers. It handles account management (Microsoft/Mojang OAuth), efficient asset management and validation, automatic Java installation/validation, and provides a natively built-in news feed and server status updates.

## Tech Stack

*   **Framework:** Electron
*   **Frontend:** React 19, Vite
*   **Styling:** Tailwind CSS (v4), shadcn/ui, Lucide React
*   **State Management:** Zustand, TanStack React Query
*   **Routing:** TanStack React Router
*   **Language:** TypeScript
*   **Testing:** Vitest, Playwright (for e2e/smoke if applicable)
*   **Bundling:** Vite (UI), esbuild (Main/Preload processes), electron-builder (Distribution)

## Architecture

The source code is organized into distinct environments typical for modern Electron applications:

*   **`src/main/`**: Electron Main Process. Handles core system operations, window management, authentication handlers, Java process management, and secure storage.
*   **`src/renderer/`**: The React UI.
    *   **`src/renderer/src/`**: Contains the React application code (`components`, `hooks`, `pages`, `stores`, `styles`).
*   **`src/preload/`**: Electron Preload scripts bridging the main and renderer processes securely.
*   **`src/shared/`**: Code shared across Main, Preload, and Renderer processes (e.g., IPC channel definitions, constants, translations, error types).
*   **`src/lib/`**: API definitions, clients, and types generated from OpenAPI specs.

### Path Aliases

*   `@/*` -> `src/renderer/src/*`
*   `@main/*` -> `src/main/*`
*   `@renderer/*` -> `src/renderer/*`
*   `@shared/*` -> `src/shared/*`
*   `@preload/*` -> `src/preload/*`

## Building and Running

### Prerequisites
*   Node.js >= 20.18.0

### Development

The primary command to start the development environment (spawns both Vite dev server for the UI and watches the main/preload scripts):

```bash
npm run dev
```

Alternatively, you can run individual watch tasks:
*   UI only: `npm run dev:ui`
*   Main only: `npm run dev:main`
*   Preload only: `npm run dev:preload`
*   Electron: `npm run dev:electron`

### Building

To build the project without packaging into an installer:
```bash
npm run build
```
*(This sequentially runs `build:ui`, `build:main`, and `build:preload`)*

### Distribution (Packaging)

To build platform-specific installers using `electron-builder`:

*   **All/Default Platform:** `npm run dist`
*   **Windows:** `npm run dist:win`
*   **macOS:** `npm run dist:mac`
*   **Linux:** `npm run dist:linux`

### Testing and Linting

*   **Tests:** `npm run test` (Runs all Vitest suites in `tests/`)
*   **Unit Tests:** `npm run test:unit`
*   **Linting:** `npm run lint` (ESLint)
*   **Type Generation:** `npm run gen-types` (Fetches OpenAPI specs to update API types)

## Development Conventions

*   **TypeScript:** Strict type checking is enabled. Use explicit typings over `any`.
*   **Styling:** Use Tailwind CSS utility classes and `shadcn/ui` component patterns.
*   **State:** Use `zustand` for global UI state and `react-query` for server state/data fetching.
*   **Testing:** New features should include accompanying tests in the `tests/` directory using Vitest.
*   **IPC Communication:** Ensure all Inter-Process Communication channels are defined in `src/shared/constants/ipc-chanels.ts` for type safety and maintainability.
