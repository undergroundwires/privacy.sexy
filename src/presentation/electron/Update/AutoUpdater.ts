import { app, dialog } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';
import { UpdateProgressBar } from './UpdateProgressBar';
import log from 'electron-log';

export async function handleAutoUpdateAsync() {
    if (await askDownloadAndInstallAsync() === DownloadDialogResult.NotNow) {
        return;
    }
    startHandlingUpdateProgress();
    await autoUpdater.downloadUpdate();
}

function startHandlingUpdateProgress() {
    const progressBar = new UpdateProgressBar();
    progressBar.showIndeterminateState();
    autoUpdater.on('error', (e) => {
        progressBar.showError(e);
    });
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
        /*
            On macOS, download-progress event is not called.
            So the indeterminate progress will continue until download is finished.
        */
        log.debug('@download-progress@\n', progress);
        progressBar.showProgress(progress);
    });
    autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
        log.info('@update-downloaded@\n', info);
        progressBar.close();
        await handleUpdateDownloadedAsync();
    });
}

async function handleUpdateDownloadedAsync() {
    if (await askRestartAndInstallAsync() === InstallDialogResult.NotNow) {
        return;
    }
    setTimeout(() => autoUpdater.quitAndInstall(), 1);
}

enum DownloadDialogResult {
    Install = 0,
    NotNow = 1,
}
async function askDownloadAndInstallAsync(): Promise<DownloadDialogResult> {
    const updateDialogResult = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Install', 'Not now' ],
        title: 'Confirm Update',
        message: 'Update available.\n\nWould you like to download and install new version?',
        detail: 'Application will automatically restart to apply update after download',
        defaultId: DownloadDialogResult.Install,
        cancelId: DownloadDialogResult.NotNow,
    });
    return updateDialogResult.response;
}

enum InstallDialogResult {
    InstallAndRestart = 0,
    NotNow = 1,
}
async function askRestartAndInstallAsync(): Promise<InstallDialogResult> {
    const installDialogResult = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Install and restart', 'Later'],
        message: 'A new version of ' + app.name + ' has been downloaded',
        detail: 'It will be installed the next time you restart the application',
        defaultId: InstallDialogResult.InstallAndRestart,
        cancelId: InstallDialogResult.NotNow,
    });
    return installDialogResult.response;
}
