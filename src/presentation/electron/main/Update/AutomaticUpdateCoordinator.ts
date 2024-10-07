import { app, dialog } from 'electron/main';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { UpdateProgressBar } from './ProgressBar/UpdateProgressBar';
import { getAutoUpdater } from './ElectronAutoUpdaterFactory';
import type { AppUpdater, UpdateInfo } from 'electron-updater';
import type { ProgressInfo } from 'electron-builder';

export async function handleAutoUpdate() {
  const autoUpdater = getAutoUpdater();
  if (await askDownloadAndInstall() === UpdateDialogResult.Postpone) {
    ElectronLogger.info('User chose to postpone update');
    return;
  }
  ElectronLogger.info('User chose to download and install update');
  try {
    await startHandlingUpdateProgress(autoUpdater);
  } catch (error) {
    ElectronLogger.error('Failed to handle auto-update process', { error });
  }
}

function startHandlingUpdateProgress(autoUpdater: AppUpdater): Promise<void> {
  return new Promise((resolve, reject) => { // Block until update process completes
    const progressBar = new UpdateProgressBar();
    progressBar.showIndeterminateState();
    autoUpdater.on('error', (e) => {
      progressBar.showError(e);
      reject(e);
    });
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      /*
        On macOS, download-progress event is not called.
        So the indeterminate progress will continue until download is finished.
      */
      ElectronLogger.debug('Update download progress', { progress });
      if (progressBar.isOpen) { // May be closed by the user
        progressBar.showProgress(progress);
      }
    });
    autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
      ElectronLogger.info('Update downloaded successfully', { version: info.version });
      progressBar.closeIfOpen();
      try {
        await handleUpdateDownloaded(autoUpdater);
      } catch (error) {
        ElectronLogger.error('Failed to handle downloaded update', { error });
        reject(error);
      }
      resolve();
    });
    autoUpdater.downloadUpdate();
  });
}

async function handleUpdateDownloaded(
  autoUpdater: AppUpdater,
): Promise<void> {
  return new Promise((resolve, reject) => { // Block until update download process completes
    askRestartAndInstall()
      .then((result) => {
        if (result === InstallDialogResult.InstallAndRestart) {
          ElectronLogger.info('User chose to install and restart for update');
          setTimeout(() => {
            try {
              autoUpdater.quitAndInstall();
              resolve();
            } catch (error) {
              ElectronLogger.error('Failed to quit and install update', { error });
              reject(error);
            }
          }, 1);
        } else {
          ElectronLogger.info('User chose to postpone update installation');
          resolve();
        }
      })
      .catch((error) => {
        ElectronLogger.error('Failed to prompt user for restart and install', { error });
        reject(error);
      });
  });
}

enum UpdateDialogResult {
  Update = 0,
  Postpone = 1,
}
async function askDownloadAndInstall(): Promise<UpdateDialogResult> {
  const updateDialogResult = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Install', 'Not now'],
    title: 'Confirm Update',
    message: 'Update available.\n\nWould you like to download and install new version?',
    detail: 'Application will automatically restart to apply update after download',
    defaultId: UpdateDialogResult.Update,
    cancelId: UpdateDialogResult.Postpone,
  });
  return updateDialogResult.response;
}

enum InstallDialogResult {
  InstallAndRestart = 0,
  Postpone = 1,
}
async function askRestartAndInstall(): Promise<InstallDialogResult> {
  const installDialogResult = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Install and restart', 'Later'],
    message: `A new version of ${app.name} has been downloaded.`,
    detail: 'It will be installed the next time you restart the application.',
    defaultId: InstallDialogResult.InstallAndRestart,
    cancelId: InstallDialogResult.Postpone,
  });
  return installDialogResult.response;
}
