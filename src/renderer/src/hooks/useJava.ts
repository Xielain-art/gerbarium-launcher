import { useState, useCallback, useEffect } from 'react';
import { useDownloadStore } from '../stores/useDownloadStore';
import { useSettingsStore } from '../stores/useSettingsStore';

export function useJava() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setJavaProgress = useDownloadStore((state) => state.setJavaProgress);
    const setIsDownloadingJava = useSettingsStore((state) => state.setIsDownloadingJava);

    useEffect(() => {
        const unsubscribe = (window as any).electronAPI.java.onDownloadProgress((percent: number) => {
            setJavaProgress(percent);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [setJavaProgress]);

    const checkJava = useCallback(async (javaPath: string) => {
        setLoading(true);
        setError(null);
        try {
            return await (window as any).electronAPI.java.checkVersion(javaPath);
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const findJava = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            return await (window as any).electronAPI.java.findSystemJava();
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadJava = useCallback(async (url: string, targetDir: string) => {
        setIsDownloadingJava(true);
        setJavaProgress(0);
        setError(null);
        try {
            const result = await (window as any).electronAPI.java.downloadJRE(url, targetDir);
            if (!result.success) throw new Error(result.error);
            return result.javaPath;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setIsDownloadingJava(false);
            setJavaProgress(0);
        }
    }, [setIsDownloadingJava, setJavaProgress]);

    return { checkJava, findJava, downloadJava, loading, error };
}
