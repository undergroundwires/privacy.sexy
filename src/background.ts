'use strict';

import { app, protocol, BrowserWindow, shell } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';


const isDevelopment = process.env.NODE_ENV !== 'production';
declare const __static: string; // https://github.com/electron-userland/electron-webpack/issues/172

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

// Setup logging
autoUpdater.logger = log; // https://www.electron.build/auto-update#debugging
log.transports.file.level = 'silly';
if (!process.env.IS_TEST) {
  Object.assign(console, log.functions);  // override console.log, console.warn etc.
}


function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1350,
    height: 1005,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
    },
    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#icons
    icon: path.join(__static, `favicon.ico`),
  });

  win.setMenuBarVisibility(false);
  configureExternalsUrlsOpenBrowser(win);
  loadApplication(win);

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString()); // tslint:disable-line:no-console
    }
  }
  createWindow();
});

// See electron-builder issue "checkForUpdatesAndNotify updates but does not notify on Windows 10"
// https://github.com/electron-userland/electron-builder/issues/2700
// https://github.com/electron/electron/issues/10864
if (process.platform === 'win32') {
  // https://docs.microsoft.com/en-us/windows/win32/shell/appid#how-to-form-an-application-defined-appusermodelid
  app.setAppUserModelId('Undergroundwires.PrivacySexy');
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

function loadApplication(window: BrowserWindow) {
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
    // tslint:disable-next-line:max-line-length
    autoUpdater.checkForUpdatesAndNotify(); // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#check-for-updates-in-background-js-ts
  }
}

function configureExternalsUrlsOpenBrowser(window: BrowserWindow) {
  window.webContents.on('new-window', (event, url) => { // handle redirect
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}
