import { useState, useCallback, useEffect } from 'react';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useSettingsStore } from '../stores/useSettingsStore';

export function useJava() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setJavaProgress = useDownloadStore((state) => state.setJavaProgress);
    const setIsDownloadingJava = useSettingsStore((state) => state.setIsDownloadingJava);
    const setJavaError = useSettingsStore((state) => state.setJavaError);

    useEffect(() => {
        const unsubscribe = window.electronAPI.java.onDownloadProgress((percent: number) => {
            setJavaProgress(percent);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [setJavaProgress]);

    const checkJava = useCallback(async (javaPath: string) => {
        setLoading(true);
        setJavaError(null);
        try {
            return await window.electronAPI.java.checkVersion(javaPath);
        } catch (err) {
            setJavaError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [setJavaError]);

    const findJava = useCallback(async () => {
        setLoading(true);
        setJavaError(null);
        try {
            return await window.electronAPI.java.findSystemJava();
        } catch (err) {
            setJavaError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [setJavaError]);

    const downloadJava = useCallback(async (url: string, targetDir: string) => {
        setIsDownloadingJava(true);
        setJavaProgress(0);
        setJavaError(null);
        try {
            const result = await window.electronAPI.java.downloadJRE(url, targetDir);
            if (!result.success) throw new Error(result.error);
            return result.javaPath;
        } catch (err) {
            setJavaError((err as Error).message);
            return null;
        } finally {
            setIsDownloadingJava(false);
            setJavaProgress(0);
        }
    }, [setIsDownloadingJava, setJavaProgress, setJavaError]);

    return { checkJava, findJava, downloadJava, loading, error: useSettingsStore((state) => state.javaError) };
}
