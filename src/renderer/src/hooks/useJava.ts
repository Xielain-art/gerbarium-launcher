import { useState, useCallback, useEffect } from 'react';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { DownloadStatus } from '../../../shared/constants/ipc-chanels';

export function useJava() {
    const setJavaProgress = useDownloadStore((state) => state.setJavaProgress);
    const setIsDownloadingJava = useSettingsStore((state) => state.setIsDownloadingJava);
    const setJavaError = useSettingsStore((state) => state.setJavaError);
    const isJavaLoading = useSettingsStore((state) => state.isJavaLoading);
    const setIsJavaLoading = useSettingsStore((state) => state.setIsJavaLoading);
    const javaError = useSettingsStore((state) => state.javaError);
    const [status, setStatus] = useState<DownloadStatus | null>(null);

    useEffect(() => {
        const unsubscribe = window.electronAPI.java.onDownloadProgress((update: { status: DownloadStatus, progress?: number }) => {
            setStatus(update.status);
            if (update.progress !== undefined) setJavaProgress(update.progress);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [setJavaProgress]);

    const checkJava = useCallback(async (javaPath: string) => {
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
    }, [setJavaError, setIsJavaLoading]);

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

    const downloadJava = useCallback(async (url: string) => {
        setIsDownloadingJava(true);
        setJavaProgress(0);
        setJavaError(null);
        try {
            console.log('Calling downloadJRE with URL:', url);
            const result = await window.electronAPI.java.downloadJRE(url);
            console.log('Result from downloadJRE:', result);
            if (!result.success) throw new Error(result.error);
            return result.javaPath;
        } catch (err) {
            console.error('Error in downloadJava hook:', err);
            setJavaError((err as Error).message);
            return null;
        } finally {
            setIsDownloadingJava(false);
            setJavaProgress(0);
            setStatus(null);
        }
    }, [setIsDownloadingJava, setJavaProgress, setJavaError]);

    return { checkJava, findJava, downloadJava, loading: isJavaLoading, error: javaError, status };
}
