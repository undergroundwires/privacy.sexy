import { dialog } from 'electron/main';

export enum ManualUpdateChoice {
  NoAction = 0,
  UpdateNow = 1,
  VisitReleasesPage = 2,
}
export async function promptForManualUpdate(): Promise<ManualUpdateChoice> {
  const visitPageResult = await dialog.showMessageBox({
    type: 'info',
    buttons: [
      'Not Now',
      'Download Update',
      'Visit Release Page',
    ],
    message: [
      'A new version is available.',
      'Would you like to download it now?',
    ].join('\n\n'),
    detail: [
      'Updates are highly recommended because they improve your privacy, security and safety.',
      '\n\n',
      'Auto-updates are not fully supported on macOS due to code signing costs.',
      'Consider donating ❤️.',
    ].join(' '),
    defaultId: ManualUpdateChoice.UpdateNow,
    cancelId: ManualUpdateChoice.NoAction,
  });
  return visitPageResult.response;
}

export enum IntegrityCheckChoice {
  Cancel = 0,
  RetryDownload = 1,
  ContinueAnyway = 2,
}

export async function promptIntegrityCheckFailure(): Promise<IntegrityCheckChoice> {
  const integrityResult = await dialog.showMessageBox({
    type: 'error',
    buttons: [
      'Cancel Update',
      'Retry Download',
      'Continue Anyway',
    ],
    message: 'Integrity check failed',
    detail:
        'The integrity check for the installer has failed,'
        + ' which means the file may be corrupted or has been tampered with.'
        + ' It is recommended to retry the download or cancel the installation for your safety.'
        + '\n\nContinuing the installation might put your system at risk.',
    defaultId: IntegrityCheckChoice.RetryDownload,
    cancelId: IntegrityCheckChoice.Cancel,
    noLink: true,
  });
  return integrityResult.response;
}

export enum InstallerErrorChoice {
  Cancel = 0,
  RetryDownload = 1,
  RetryOpen = 2,
}

export async function promptInstallerOpenError(): Promise<InstallerErrorChoice> {
  const result = await dialog.showMessageBox({
    type: 'error',
    buttons: [
      'Cancel Update',
      'Retry Download',
      'Retry Installation',
    ],
    message: 'Installation Error',
    detail: 'The installer could not be launched. Please try again.',
    defaultId: InstallerErrorChoice.RetryOpen,
    cancelId: InstallerErrorChoice.Cancel,
    noLink: true,
  });
  return result.response;
}

export enum DownloadErrorChoice {
  Cancel = 0,
  RetryDownload = 1,
}

export async function promptDownloadError(): Promise<DownloadErrorChoice> {
  const result = await dialog.showMessageBox({
    type: 'error',
    buttons: [
      'Cancel Update',
      'Retry Download',
    ],
    message: 'Download Error',
    detail: 'Unable to download the update. Check your internet connection or try again later.',
    defaultId: DownloadErrorChoice.RetryDownload,
    cancelId: DownloadErrorChoice.Cancel,
    noLink: true,
  });
  return result.response;
}

export enum UnexpectedErrorChoice {
  Cancel = 0,
  RetryUpdate = 1,
}

export async function showUnexpectedError(): Promise<UnexpectedErrorChoice> {
  const result = await dialog.showMessageBox({
    type: 'error',
    buttons: [
      'Cancel',
      'Retry Update',
    ],
    message: 'Unexpected Error',
    detail: 'An unexpected error occurred. Would you like to retry updating?',
    defaultId: UnexpectedErrorChoice.RetryUpdate,
    cancelId: UnexpectedErrorChoice.Cancel,
    noLink: true,
  });
  return result.response;
}
