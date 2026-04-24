import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./src/router";
import "./index.css";

// 1. Глобальный перехват необработанных ошибок (синхронных)
window.addEventListener("error", (event) => {
  const errorMsg = `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
  // ГЛУШИТЕЛЬ: .catch(() => {}) блокирует петлю рекурсивных ошибок
  window.electronAPI.system.logAction("UNCAUGHT_ERROR", errorMsg).catch(() => {});
});

// 2. Перехват ошибок промисов (асинхронных - fetch, таймауты)
window.addEventListener("unhandledrejection", (event) => {
  const errorMsg =
    event.reason instanceof Error
      ? event.reason.stack || event.reason.message
      : String(event.reason);
  window.electronAPI?.system.logAction("UNHANDLED_REJECTION", errorMsg).catch(() => {});
});

// Отмечаем запуск фронтенда
window.electronAPI?.system.logAction("APP_START", "React Renderer Initialized").catch(() => {});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
