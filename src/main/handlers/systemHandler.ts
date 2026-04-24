import os from 'os';
import { ipcMain, shell } from 'electron';
import log from 'electron-log';
import { IPC_CHANNELS } from '../../shared/constants/ipc-chanels';
import { LOG_MESSAGES } from '../../shared/constants/log-messages';

export interface SystemMemory {
  total: number;
  free: number;
}

export default function systemHandler() {
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_MEMORY, (): SystemMemory => {
    log.debug(LOG_MESSAGES.SYSTEM_GET_MEMORY);
    return {
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
    };
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_CPUS, () => {
    log.debug(LOG_MESSAGES.SYSTEM_GET_CPUS);
    return os.cpus().length;
  });

  // App version — replaces magic string "get-app-version" in index.js
  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, () => {
    const { app } = require('electron') as typeof import('electron');
    return app.getVersion();
  });

  // Open external URL
  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, async (_event, url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await shell.openExternal(url);
    }
  });

  // Open GitHub Issue with template
  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE, async () => {
    const { app } = require('electron') as typeof import('electron');
    const { GITHUB_TEMPLATES, EXTERNAL_URLS } = require('../../shared/constants/system');
    
    const issueBody = encodeURIComponent(
      GITHUB_TEMPLATES.CONTACT_BODY(process.platform, process.arch, app.getVersion())
    );
    await shell.openExternal(
      `${EXTERNAL_URLS.GITHUB_ISSUES}?body=${issueBody}`
    );
  });
}