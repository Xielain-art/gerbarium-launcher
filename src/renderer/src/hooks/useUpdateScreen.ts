import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../shared/constants/system";
import type { UpdateInfoPayload } from "../../../shared/constants/ipc-chanels";
import { useStartupGateStore } from "../stores/useStartupGateStore";
import { useAppVersionQuery } from "./queries/useSystemQueries";

const UPDATE_SEARCHING_MESSAGE = "Searching for updates...";
const UPDATE_NONE_MESSAGE = "update-not-available";
const UPDATE_STARTING_MESSAGE = "Starting launcher...";
const UPDATE_FOUND_MESSAGE = "Update found";

export function useUpdateScreen(): {
  appVersion: string;
  updateMessage: string;
  updateProgress: number;
} {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const setUpdateGatePassed = useStartupGateStore(
    (state) => state.setUpdateGatePassed,
  );
  const appVersionQuery = useAppVersionQuery();
  const [updateMessage, setUpdateMessage] = useState<string>(
    UPDATE_SEARCHING_MESSAGE,
  );
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfoPayload | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const isSmokeTest =
    window.electronAPI?.getSmokeTestConfig?.()?.isSmokeTest ?? false;

  useEffect(() => {
    setUpdateGatePassed(false);

    if (isDevMode || isSmokeTest) {
      setUpdateGatePassed(true);
      navigate({ to: ROUTES.LOGIN });
      return;
    }

    if (!window.electronAPI?.getAppVersion) {
      navigate({ to: ROUTES.LOGIN });
      return;
    }

    const unsubMessage = window.electronAPI.onUpdateMessage((message) => {
      setUpdateMessage(message);
      if (message === UPDATE_NONE_MESSAGE) {
        setUpdateGatePassed(true);
        setUpdateMessage(UPDATE_STARTING_MESSAGE);
        setTimeout(() => navigate({ to: ROUTES.LOGIN }), 1500);
      }
    });

    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      const payload =
        typeof info === "object" && info !== null
          ? (info as UpdateInfoPayload)
          : null;
      setUpdateInfo(payload);
    });

    const unsubProgress = window.electronAPI.onUpdateProgress((progress) => {
      setDownloadStarted(true);
      setUpdateProgress(progress.percent);
    });

    window.electronAPI.startUpdateCheck();

    return () => {
      unsubMessage?.();
      unsubInfo?.();
      unsubProgress?.();
    };
  }, [navigate, isDevMode, setUpdateGatePassed, isSmokeTest]);

  useEffect(() => {
    if (updateInfo && !downloadStarted) {
      setUpdateMessage(
        `${UPDATE_FOUND_MESSAGE} (${updateInfo.version})`,
      );
    }
  }, [updateInfo, downloadStarted]);

  return {
    appVersion: appVersionQuery.data ?? "",
    updateMessage,
    updateProgress,
  };
}
