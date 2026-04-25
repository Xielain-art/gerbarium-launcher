import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WindowControls } from "../components";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";
import { ROUTES } from "../../../shared/constants/system";
import type { UpdateInfoPayload } from "../../../shared/constants/ipc-chanels";
import { UpdateStatusCard } from "../components/update";
import { useStartupGateStore } from "../stores/useStartupGateStore";

export function UpdateScreen() {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const setUpdateGatePassed = useStartupGateStore((state) => state.setUpdateGatePassed);
  const [appVersion, setAppVersion] = useState<string>("");
  const [updateMessage, setUpdateMessage] = useState<string>(UI_STRINGS.UPDATE_SCREEN.SEARCHING);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfoPayload | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    setUpdateGatePassed(false);

    if (isDevMode) {
      setUpdateGatePassed(true);
      navigate({ to: ROUTES.LOGIN });
      return;
    }

    if (!window.electronAPI?.getAppVersion) {
      navigate({ to: ROUTES.LOGIN });
      return;
    }

    void window.electronAPI.getAppVersion().then(setAppVersion);
    window.electronAPI.initUpdate();

    const unsubMessage = window.electronAPI.onUpdateMessage((message) => {
      setUpdateMessage(message);
      if (message === UI_STRINGS.UPDATE_SCREEN.NONE) {
        setUpdateGatePassed(true);
        setUpdateMessage(UI_STRINGS.UPDATE_SCREEN.STARTING_LAUNCHER);
        setTimeout(() => navigate({ to: ROUTES.LOGIN }), 1500);
      }
    });

    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      const payload =
        typeof info === "object" && info !== null ? (info as UpdateInfoPayload) : null;
      setUpdateInfo(payload);
    });

    const unsubProgress = window.electronAPI.onUpdateProgress((progress) => {
      if (!downloadStarted) {
        setDownloadStarted(true);
      }
      setUpdateProgress(progress.percent);
    });

    window.electronAPI.startUpdateCheck();

    return () => {
      unsubMessage?.();
      unsubInfo?.();
      unsubProgress?.();
    };
  }, [navigate, isDevMode, setUpdateGatePassed, downloadStarted]);

  useEffect(() => {
    if (updateInfo && !downloadStarted) {
      setUpdateMessage(`${UI_STRINGS.UPDATE_SCREEN.FOUND} (${updateInfo.version})`);
    }
  }, [updateInfo, downloadStarted]);

  return (
    <div className="bg-theme-main-gradient relative flex h-screen w-full flex-col overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute right-4 top-4 z-50">
        <WindowControls />
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <UpdateStatusCard
          appVersion={appVersion}
          updateMessage={updateMessage}
          updateProgress={updateProgress}
        />
      </div>
    </div>
  );
}
