import { ipcMain, shell, dialog } from 'electron';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import { IPC_CHANNELS } from '../../shared/constants/ipc-chanels';

export default function setupLogHandler(app: Electron.App) {
    ipcMain.handle(IPC_CHANNELS.LOG.EXPORT_AND_REPORT, async () => {
        try {
            const logsPath = path.join(app.getPath('userData'), 'logs');

            if (!await fs.pathExists(logsPath)) {
                return { success: false, error: 'Папка с логами не найдена' };
            }

            const files = await fs.readdir(logsPath);
            if (files.length === 0) {
                return { success: false, error: 'Папка с логами пуста' };
            }

            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Сохранить архив с логами',
                defaultPath: path.join(app.getPath('desktop'), `GerbariumLogs_${Date.now()}.zip`),
                filters: [{ name: 'Zip Archive', extensions: ['zip'] }],
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Отменено пользователем' };
            }

            await new Promise<void>((resolve, reject) => {
                const output = fs.createWriteStream(filePath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', resolve);
                archive.on('error', reject);

                archive.pipe(output);
                archive.directory(logsPath, false);
                archive.finalize();
            });

            const issueBody = encodeURIComponent(
                "**Системные данные:**\n" +
                `- ОС: ${process.platform} ${process.arch}\n` +
                `- Версия: ${app.getVersion()}\n\n` +
                "*(Пожалуйста, прикрепите архив GerbariumLogs сюда)*"
            );
            await shell.openExternal(`https://github.com/Xielain-art/gerbarium-releases/issues/new?body=${issueBody}`);

            return { success: true, path: filePath };
        } catch (e) {
            const error = e as Error;
            log.error("Failed to export logs", error);
            return { success: false, error: error.message };
        }
    });

    // Обработчик пользовательских действий (LOG_ACTION)
    ipcMain.handle(IPC_CHANNELS.SYSTEM.LOG_ACTION, (_, action: string, details?: string) => {
        log.info("[USER ACTION]", action, details);
        const logPath = path.join(app.getPath("userData"), "user-actions.log");
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] [${action}] ${details || ""}\n`;
        fs.appendFileSync(logPath, entry);
    });
}