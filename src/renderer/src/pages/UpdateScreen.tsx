import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WindowControls } from "../components";

export function UpdateScreen() {
  const navigate = useNavigate();
  const [appVersion, setAppVersion] = useState<string>("");
  const [updateMessage, setUpdateMessage] = useState<string>("Поиск обновлений...");
  const [updateProgress, setUpdateProgress] = useState<number>(0);

  useEffect(() => {
    // Get app version
    window.electronAPI.getAppVersion().then(setAppVersion);

    // Subscribe to update messages BEFORE triggering the check
    const unsubscribeMessage = window.electronAPI.onUpdateMessage((message) => {
      setUpdateMessage(message);

      // Navigate to login when update check is complete (no update or error)
      if (message === "update-not-available" || message.includes("Ошибка")) {
        // Show "launching" message for better UX
        if (message === "update-not-available") {
          setUpdateMessage("Запуск лаунчера...");
        }
        setTimeout(() => navigate({ to: "/login" }), 1500);
      }
      // Don't navigate if update is being downloaded - app will restart
      if (message.includes("Перезагрузка")) {
        // Update is downloading, will restart after install
      }
    });

    // Subscribe to update progress
    const unsubscribeProgress = window.electronAPI.onUpdateProgress((progress) => {
      setUpdateProgress(progress.percent);
    });

    // TRIGGER update check from renderer
    if (window.electronAPI.startUpdateCheck) {
      window.electronAPI.startUpdateCheck();
    } else {
      // Fallback for development if startUpdateCheck is not in preload
      setTimeout(() => navigate({ to: "/login" }), 2000);
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeMessage();
      unsubscribeProgress();
    };
  }, [navigate]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-[#1a1c20] via-[#2b2d31] to-[#1a1c20]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Window Controls */}
      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      {/* Centered Content */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Logo / Icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-[#2b2d31]/50 shadow-2xl">
              <span className="text-5xl">💎</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center font-minecraft text-2xl font-bold text-[#e0e0e0]">
            Gerbarium Launcher
          </h1>

          {/* Version */}
          {appVersion && (
            <p className="mb-8 text-center font-minecraft text-sm text-[#8a8a8a]">
              Версия: {appVersion}
            </p>
          )}

          {/* Update Status Card */}
          <div className="mc-card">
            <div className="mb-4 text-center">
              <p className="font-minecraft text-sm text-[#55aaff]">
                {updateMessage}
              </p>
            </div>

            {/* Progress Bar */}
            {updateProgress > 0 && (
              <div className="space-y-2">
                <div className="mc-progress">
                  <div
                    className="mc-progress-fill mc-progress-striped"
                    style={{ width: `${updateProgress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-minecraft text-base font-bold text-white drop-shadow-[2px_2px_0_#000]">
                      {Math.round(updateProgress)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <p className="mt-6 text-center font-minecraft text-xs text-[#5a5a5a]">
            © 2026 Gerbarium. Radmir Klimau.
          </p>
        </div>
      </div>
    </div>
  );
}
