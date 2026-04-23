import { ipcMain } from 'electron';
import { checkJavaVersion, findJavaInSystem, downloadAndExtractJRE } from './javaHandler';

export default function javaHandler() {
    ipcMain.handle('java:checkVersion', async (_, javaPath: string) => {
        return await checkJavaVersion(javaPath);
    });

    ipcMain.handle('java:findSystemJava', async () => {
        return await findJavaInSystem();
    });

    ipcMain.handle('java:downloadJRE', async (event, { url, targetDir }) => {
        console.log('Received download request for:', url);
        try {
            const javaPath = await downloadAndExtractJRE(url, targetDir, (percent) => {
                event.sender.send('java:downloadProgress', percent);
            });
            console.log('Download complete, path:', javaPath);
            return { success: true, javaPath };
        } catch (error) {
            console.error('Download failed:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}
