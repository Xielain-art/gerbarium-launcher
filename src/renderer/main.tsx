import { useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./src/router";
import "./index.css";
import "./src/styles/themes/auto-load-themes";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ThemeWrapper } from "./src/components/ThemeWrapper";
import { queryClient } from "./src/lib/queryClient";
import { Toaster } from "./src/components/shadcn/ui";

// 1. Global Sync Error Handler
window.addEventListener("error", (event) => {
  const errorMsg = `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
  // .catch(() => {}) prevents recursive error reporting loops
  window.electronAPI.system
    .logAction("UNCAUGHT_ERROR", errorMsg)
    .catch(() => {});
});

// 2. Global Promise Rejection Handler
window.addEventListener("unhandledrejection", (event) => {
  const errorMsg =
    event.reason instanceof Error
      ? event.reason.stack || event.reason.message
      : String(event.reason);

  window.electronAPI?.system
    .logAction("UNHANDLED_REJECTION", errorMsg)
    .catch(() => {});
});

// Track application initialization
window.electronAPI?.system
  .logAction("APP_START", "React Renderer Initialized")
  .catch(() => {});

export function AppReadyNotifier(): null {
  useEffect(() => {
    window.electronAPI?.system.sendUiReady();
  }, []);

  return null;
}


const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper>
          <AppReadyNotifier />
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </ThemeWrapper>
      </QueryClientProvider>
    </StrictMode>,
  );
}

