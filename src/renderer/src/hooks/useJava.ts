import { useState, useCallback } from 'react';

export function useJava() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const downloadJRE = useCallback(async (url: string, targetDir: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await (window as any).electronAPI.java.downloadJRE(url, targetDir);
            if (!result.success) throw new Error(result.error);
            return true;
        } catch (err) {
            setError((err as Error).message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { checkJava, findJava, downloadJRE, loading, error };
}
