import { app, dialog } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';
import log from 'electron-log';
import { UpdateProgressBar } from './UpdateProgressBar';

interface IUpdater {
    checkForUpdatesAsync(): Promise<void>;
}

export function setupAutoUpdater(): IUpdater {
    autoUpdater.logger = log;
    autoUpdater.on('error', (error: Error) => {
        log.error('@error@\n', error);
    });
    autoUpdater.on('update-available', async (info: UpdateInfo) => {
        log.info('@update-available@\n', info);
        await handleAvailableUpdateAsync();
    });
    return {
        checkForUpdatesAsync: async () => {
            await autoUpdater.checkForUpdates();
        },
    };
}

async function handleAvailableUpdateAsync() {
    if (!await dialogs.askDownloadAndInstallAsync()) {
        return;
    }
    autoUpdater.downloadUpdate();
    handleUpdateProgress();
}

function handleUpdateProgress() {
    const progressBar = new UpdateProgressBar();
    progressBar.showIndeterminateState();
    autoUpdater.on('error', (e) => {
        progressBar.showError(e);
    });
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
        /*
            On macOS, download-progress event is not called
            so the indeterminate progress will continue until download is finished.
        */
        log.info('@update-progress@\n', progress);
        progressBar.showProgress(progress);
    });
    autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
        log.info('@update-downloaded@\n', info);
        progressBar.close();
        await handleUpdateDownloadedAsync();
    });
}

const dialogs = {
    askDownloadAndInstallAsync: async () => {
        const updateDialogResult = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Install', 'Not now' ],
            title: 'Confirm Update',
            message: 'Update available.\n\nWould you like to download and install new version?',
            detail: 'Application will automatically restart to apply update after download',
        });
        return updateDialogResult.response === 0;
    },
    askRestartAndInstallAsync: async () => {
        const installDialogResult = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Install and restart', 'Later'],
            defaultId: 0,
            message: 'A new version of ' + app.name + ' has been downloaded',
            detail: 'It will be installed the next time you restart the application',
        });
        return installDialogResult.response === 0;
    },
};

async function handleUpdateDownloadedAsync() {
    if (await dialogs.askRestartAndInstallAsync()) {
        setTimeout(() => autoUpdater.quitAndInstall(), 1);
    }
}
