import { ipcMain } from 'electron';
import { checkJavaVersion, findJavaInSystem, downloadAndExtractJRE } from './javaHandler';
import { IPC_CHANNELS } from '../../shared/constants/ipc-chanels';

export default function javaHandler() {
    ipcMain.handle(IPC_CHANNELS.JAVA.CHECK_VERSION, async (_, javaPath: string) => {
        return await checkJavaVersion(javaPath);
    });

    ipcMain.handle(IPC_CHANNELS.JAVA.FIND_SYSTEM, async () => {
        return await findJavaInSystem();
    });

    ipcMain.handle(IPC_CHANNELS.JAVA.SELECT_EXECUTABLE, async () => {
        const { dialog } = require('electron');
        const filters = process.platform === 'win32' 
            ? [{ name: 'Java Executable', extensions: ['exe'] }] 
            : [];
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters
        });
        return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle(IPC_CHANNELS.JAVA.DOWNLOAD, async (event, { url, targetDir }) => {
        try {
            const javaPath = await downloadAndExtractJRE(url, targetDir, (percent) => {
                event.sender.send(IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS, percent);
            });
            return { success: true, javaPath };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
}
