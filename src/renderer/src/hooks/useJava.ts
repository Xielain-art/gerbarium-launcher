import { useState, useCallback, useEffect } from "react";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { DownloadStatus } from "../../../shared/constants/ipc-chanels";

export function useJava() {
  const setJavaProgress = useDownloadStore((state) => state.setJavaProgress);
  const setIsDownloadingJava = useSettingsStore(
    (state) => state.setIsDownloadingJava,
  );
  const setJavaError = useSettingsStore((state) => state.setJavaError);
  const isJavaLoading = useSettingsStore((state) => state.isJavaLoading);
  const setIsJavaLoading = useSettingsStore((state) => state.setIsJavaLoading);
  const javaError = useSettingsStore((state) => state.javaError);
  const [status, setStatus] = useState<DownloadStatus | null>(null);

  useEffect(() => {
    const unsubscribe = window.electronAPI.java.onDownloadProgress(
      (update: { status: DownloadStatus; progress?: number }) => {
        setStatus(update.status);
        if (update.progress !== undefined) setJavaProgress(update.progress);
      },
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setJavaProgress]);

  const checkJava = useCallback(
    async (javaPath: string) => {
      setIsJavaLoading(true);
      setJavaError(null);
      try {
        return await window.electronAPI.java.checkVersion(javaPath);
      } catch (err) {
        setJavaError((err as Error).message);
        return null;
      } finally {
        setIsJavaLoading(false);
      }
    },
    [setJavaError, setIsJavaLoading],
  );

  const findJava = useCallback(async () => {
    setIsJavaLoading(true);
    setJavaError(null);
    try {
      return await window.electronAPI.java.findSystemJava();
    } catch (err) {
      setJavaError((err as Error).message);
      return null;
    } finally {
      setIsJavaLoading(false);
    }
  }, [setJavaError, setIsJavaLoading]);

  const downloadJava = useCallback(
    async (javaVersion: number) => {
      setIsDownloadingJava(true);
      setJavaProgress(0);
      setJavaError(null);
      try {
        const result = await window.electronAPI.java.downloadJRE(javaVersion);
        if (!result.success) throw new Error(result.error);
        return result.javaPath;
      } catch (err) {
        console.error("Error in downloadJava hook:", err);
        setJavaError((err as Error).message);
        return null;
      } finally {
        setIsDownloadingJava(false);
        setJavaProgress(0);
        setStatus(null);
      }
    },
    [setIsDownloadingJava, setJavaProgress, setJavaError],
  );

  const getInstalledJava = useCallback(async () => {
    try {
      return await window.electronAPI.java.getInstalledJava();
    } catch (err) {
      console.error("Error getting installed Java:", err);
      return [];
    }
  }, []);

  const getJavaVersions = useCallback(async () => {
    try {
      return await window.electronAPI.java.getJavaVersions();
    } catch (err) {
      console.error("Error getting Java versions:", err);
      return [8, 17, 21];
    }
  }, []);

  return {
    checkJava,
    findJava,
    downloadJava,
    getInstalledJava,
    getJavaVersions,
    loading: isJavaLoading,
    error: javaError,
    status,
  };
}
