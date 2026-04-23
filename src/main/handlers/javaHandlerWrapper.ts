import { ipcMain } from 'electron';
import { checkJavaVersion, findJavaInSystem, downloadAndExtractJRE } from './javaHandler';

export default function javaHandler() {
    ipcMain.handle('java:checkVersion', async (_, javaPath: string) => {
        return await checkJavaVersion(javaPath);
    });

    ipcMain.handle('java:findSystemJava', async () => {
        return await findJavaInSystem();
    });

    ipcMain.handle('java:downloadJRE', async (_, { url, targetDir }) => {
        try {
            await downloadAndExtractJRE(url, targetDir);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
}
