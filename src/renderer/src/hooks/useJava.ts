import { useState, useCallback, useEffect } from "react";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import {
  DownloadStatus,
  JavaDownloadProgressPayload,
} from "../../../shared/constants/ipc-chanels";
import { LOG_ACTIONS } from "../../../shared/constants/system";

const logAction = (action: string, details?: string) => {
  window.electronAPI?.system.logAction(action, details);
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
      (update: JavaDownloadProgressPayload) => {
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
       logAction(LOG_ACTIONS.CHECK_JAVA, javaPath);
       try {
         const version = await window.electronAPI.java.checkVersion(javaPath);
         if (version) logAction(LOG_ACTIONS.CHECK_JAVA_SUCCESS, `Version: ${version}`);
         return version;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
         setJavaError(errMsg);
         logAction(LOG_ACTIONS.CHECK_JAVA_ERROR, errMsg);
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
     logAction(LOG_ACTIONS.FIND_JAVA_START, 'Searching for system Java');
     try {
       const javaPath = await window.electronAPI.java.findSystemJava();
       if (javaPath) logAction(LOG_ACTIONS.FIND_JAVA_SUCCESS, javaPath);
       else logAction(LOG_ACTIONS.FIND_JAVA_NOT_FOUND, 'No system Java found');
       return javaPath;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
       setJavaError(errMsg);
       logAction(LOG_ACTIONS.FIND_JAVA_ERROR, errMsg);
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
      logAction(LOG_ACTIONS.DOWNLOAD_JAVA_START, `Java ${javaVersion}`);
      try {
        const result = await window.electronAPI.java.downloadJRE(javaVersion);
        if (!result.success) throw new Error(result.error || 'Unknown error');
        logAction(LOG_ACTIONS.DOWNLOAD_JAVA_COMPLETE, `Java ${javaVersion} - ${result.javaPath}`);
        return result.javaPath;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setJavaError(errMsg);
        logAction(LOG_ACTIONS.DOWNLOAD_JAVA_ERROR, errMsg);
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
     logAction(LOG_ACTIONS.GET_INSTALLED_JAVA_START, 'Fetching installed Java list');
     try {
       const list = await window.electronAPI.java.getInstalledJava();
       logAction(LOG_ACTIONS.GET_INSTALLED_JAVA_SUCCESS, `Found ${list.length} installations`);
       return list;
     } catch (err: unknown) {
       const errMsg = err instanceof Error ? err.message : "Unknown error";
       logAction(LOG_ACTIONS.GET_INSTALLED_JAVA_ERROR, errMsg);
       return [];
     }
   }, []);

   const getJavaVersions = useCallback(async () => {
     logAction(LOG_ACTIONS.GET_JAVA_VERSIONS_START, 'Fetching available Java versions');
     try {
       const versions = await window.electronAPI.java.getJavaVersions();
       logAction(LOG_ACTIONS.GET_JAVA_VERSIONS_SUCCESS, `Available: ${versions.join(', ')}`);
       return versions;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
       logAction(LOG_ACTIONS.GET_JAVA_VERSIONS_ERROR, errMsg);
       return [];
     }
   }, []);

  const removeJava = useCallback(async (javaVersion: number) => {
    logAction(LOG_ACTIONS.REMOVE_JAVA_START, `Java ${javaVersion}`);
    try {
      const result = await window.electronAPI.java.removeJava(javaVersion);
      if (!result.success) throw new Error(result.error || 'Unknown error');
      logAction(LOG_ACTIONS.REMOVE_JAVA_COMPLETE, `Java ${javaVersion}`);
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      logAction(LOG_ACTIONS.REMOVE_JAVA_ERROR, errMsg);
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
