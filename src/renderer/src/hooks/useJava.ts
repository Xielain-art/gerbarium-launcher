import { useState, useCallback, useEffect } from "react";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { DownloadStatus } from "../../../shared/constants/ipc-chanels";

const logAction = (action: string, details?: string) => {
  window.logAction?.(action, details);
};

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
      logAction('DOWNLOAD_JAVA_START', `Java ${javaVersion}`);
      try {
        const result = await window.electronAPI.java.downloadJRE(javaVersion);
        if (!result.success) throw new Error(result.error);
        logAction('DOWNLOAD_JAVA_COMPLETE', `Java ${javaVersion} - ${result.javaPath}`);
        return result.javaPath;
      } catch (err) {
        console.error("Error in downloadJava hook:", err);
        const errMsg = (err as Error).message;
        setJavaError(errMsg);
        logAction('DOWNLOAD_JAVA_ERROR', errMsg);
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
      return [];
    }
  }, []);

  const removeJava = useCallback(async (javaVersion: number) => {
    logAction('REMOVE_JAVA_START', `Java ${javaVersion}`);
    try {
      const result = await window.electronAPI.java.removeJava(javaVersion);
      if (!result.success) throw new Error(result.error);
      logAction('REMOVE_JAVA_COMPLETE', `Java ${javaVersion}`);
      return true;
    } catch (err) {
      console.error("Error removing Java:", err);
      const errMsg = (err as Error).message;
      logAction('REMOVE_JAVA_ERROR', errMsg);
      return false;
    }
  }, []);

  return {
    checkJava,
    findJava,
    downloadJava,
    getInstalledJava,
    getJavaVersions,
    removeJava,
    loading: isJavaLoading,
    error: javaError,
    status,
  };
}
