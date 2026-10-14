import { vi } from 'vitest';

const { rejectUnsafeOperation, BlockedWindow } = vi.hoisted(() => {
  const reject = (operation: string): never => {
    throw new Error(`Safe test profile blocked runtime boundary: ${operation}`);
  };

  class UnsafeWindow {
    public constructor() {
      reject('desktop window construction');
    }
  }

  return { rejectUnsafeOperation: reject, BlockedWindow: UnsafeWindow };
});

vi.mock('electron', () => ({
  app: {
    getPath: () => rejectUnsafeOperation('electron.app.getPath'),
    get isPackaged(): never {
      return rejectUnsafeOperation('electron.app.isPackaged');
    },
    get name(): never {
      return rejectUnsafeOperation('electron.app.name');
    },
    exit: () => rejectUnsafeOperation('electron.app.exit'),
  },
  BrowserWindow: BlockedWindow,
  contextBridge: {
    exposeInMainWorld: () => rejectUnsafeOperation('electron.contextBridge.exposeInMainWorld'),
  },
  dialog: {
    showErrorBox: () => rejectUnsafeOperation('electron.dialog.showErrorBox'),
    showMessageBox: () => rejectUnsafeOperation('electron.dialog.showMessageBox'),
    showSaveDialog: () => rejectUnsafeOperation('electron.dialog.showSaveDialog'),
  },
  ipcMain: {
    handle: () => rejectUnsafeOperation('electron.ipcMain.handle'),
  },
  ipcRenderer: {
    invoke: () => rejectUnsafeOperation('electron.ipcRenderer.invoke'),
  },
  shell: {
    openExternal: () => rejectUnsafeOperation('electron.shell.openExternal'),
  },
}));

vi.mock('electron-log/main', () => ({
  default: {
    debug: () => rejectUnsafeOperation('electron-log.debug'),
    error: () => rejectUnsafeOperation('electron-log.error'),
    info: () => rejectUnsafeOperation('electron-log.info'),
    log: () => rejectUnsafeOperation('electron-log.log'),
    silly: () => rejectUnsafeOperation('electron-log.silly'),
    verbose: () => rejectUnsafeOperation('electron-log.verbose'),
    warn: () => rejectUnsafeOperation('electron-log.warn'),
  },
}));

vi.mock('electron-progressbar', () => ({
  default: BlockedWindow,
}));

vi.mock('electron-updater', () => ({
  default: {
    get autoUpdater(): never {
      return rejectUnsafeOperation('electron-updater.autoUpdater');
    },
  },
}));

vi.mock('node:child_process', () => {
  const commands = {
    exec: () => rejectUnsafeOperation('node:child_process.exec'),
    execFile: () => rejectUnsafeOperation('node:child_process.execFile'),
    execFileSync: () => rejectUnsafeOperation('node:child_process.execFileSync'),
    execSync: () => rejectUnsafeOperation('node:child_process.execSync'),
    fork: () => rejectUnsafeOperation('node:child_process.fork'),
    spawn: () => rejectUnsafeOperation('node:child_process.spawn'),
    spawnSync: () => rejectUnsafeOperation('node:child_process.spawnSync'),
  };
  return { ...commands, default: commands };
});
