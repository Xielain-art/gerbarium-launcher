import { ipcMain, app, shell } from 'electron';
import AdmZip from 'adm-zip';
import path from 'path';

export default function setupLogHandler() {
    ipcMain.handle('logs:export-and-report', async () => {
        try {
            // 1. Создаем архив с логами на Рабочем столе
            const logsPath = path.join(app.getPath('userData'), 'logs'); // Путь от electron-log
            const desktopPath = app.getPath('desktop');
            const zipPath = path.join(desktopPath, `GerbariumLogs_${Date.now()}.zip`);
            
            const zip = new AdmZip();
            zip.addLocalFolder(logsPath);
            zip.writeZip(zipPath);

            // 2. Открываем GitHub Issue с предзаполненным шаблоном
            const issueBody = encodeURIComponent(
                "**Системные данные:**\n" +
                `- ОС: ${process.platform} ${process.arch}\n` +
                `- Версия: ${app.getVersion()}\n\n` +
                "*(Пожалуйста, прикрепите архив GerbariumLogs с рабочего стола сюда)*"
            );
            await shell.openExternal(`https://github.com/Xielain-art/gerbarium-releases/issues/new?body=${issueBody}`);

            return { success: true, path: zipPath };
        } catch (e) {
            console.error("Failed to export logs", e);
            return { success: false };
        }
    });
}