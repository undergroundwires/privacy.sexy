import { shell } from 'electron';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { GitHubProjectDetails } from '@/domain/Project/GitHubProjectDetails';
import { Version } from '@/domain/Version';
import { parseProjectDetails } from '@/application/Parser/ProjectDetailsParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { UpdateProgressBar } from '../ProgressBar/UpdateProgressBar';
import {
  promptForManualUpdate, promptInstallerOpenError,
  promptIntegrityCheckFailure, promptDownloadError,
  DownloadErrorChoice, InstallerErrorChoice, IntegrityCheckChoice,
  ManualUpdateChoice, showUnexpectedError, UnexpectedErrorChoice,
} from './Dialogs';
import { type DownloadUpdateResult, downloadUpdate } from './Downloader';
import { checkIntegrity } from './Integrity';
import { startInstallation } from './Installer';
import { clearUpdateInstallationFiles } from './InstallationFiles/InstallationFileCleaner';
import type { UpdateInfo } from 'electron-updater';

export function requiresManualUpdate(
  nodePlatform: string = process.platform,
): boolean {
  // autoUpdater cannot handle DMG files, requiring manual download management for these file types.
  return nodePlatform === 'darwin';
}

export async function startManualUpdateProcess(info: UpdateInfo) {
  try {
    await clearUpdateInstallationFiles();
  } catch (error) {
    ElectronLogger.warn('Failed to clear previous update installation files', { error });
  } finally {
    await executeManualUpdateProcess(info);
  }
}

async function executeManualUpdateProcess(info: UpdateInfo): Promise<void> {
  try {
    const updateAction = await promptForManualUpdate();
    if (updateAction === ManualUpdateChoice.NoAction) {
      ElectronLogger.info('User chose to cancel the update');
      return;
    }
    const { releaseUrl, downloadUrl } = getRemoteUpdateUrls(info.version);
    if (updateAction === ManualUpdateChoice.VisitReleasesPage) {
      ElectronLogger.info('User chose to visit release page', { url: releaseUrl });
      await shell.openExternal(releaseUrl);
    } else if (updateAction === ManualUpdateChoice.UpdateNow) {
      ElectronLogger.info('User chose to download and install update');
      await downloadAndInstallUpdate(downloadUrl, info);
    }
  } catch (err) {
    ElectronLogger.error('Failed to execute auto-update process', { error: err });
    await handleUnexpectedError(info);
  }
}

async function downloadAndInstallUpdate(fileUrl: string, info: UpdateInfo) {
  let download: DownloadUpdateResult | undefined;
  await withProgressBar(async (progressBar) => {
    download = await downloadUpdate(info, fileUrl, progressBar);
  });
  if (!download?.success) {
    await handleFailedDownload(info);
    return;
  }
  if (await isIntegrityPreserved(download.installerPath, fileUrl, info)) {
    await openInstaller(download.installerPath, info);
    return;
  }
  const userAction = await promptIntegrityCheckFailure();
  if (userAction === IntegrityCheckChoice.RetryDownload) {
    ElectronLogger.info('User chose to retry download after integrity check failure');
    await startManualUpdateProcess(info);
  } else if (userAction === IntegrityCheckChoice.ContinueAnyway) {
    ElectronLogger.warn('User chose to proceed with installation despite failed integrity check');
    await openInstaller(download.installerPath, info);
  }
}

async function handleFailedDownload(info: UpdateInfo) {
  const userAction = await promptDownloadError();
  if (userAction === DownloadErrorChoice.Cancel) {
    ElectronLogger.info('User chose to cancel update download');
  } else if (userAction === DownloadErrorChoice.RetryDownload) {
    ElectronLogger.info('User chose to retry update download');
    await startManualUpdateProcess(info);
  }
}

async function handleUnexpectedError(info: UpdateInfo) {
  const userAction = await showUnexpectedError();
  if (userAction === UnexpectedErrorChoice.Cancel) {
    ElectronLogger.info('User chose to cancel update process after unexpected error');
  } else if (userAction === UnexpectedErrorChoice.RetryUpdate) {
    ElectronLogger.info('User chose to retry update process after unexpected error');
    await startManualUpdateProcess(info);
  }
}

async function openInstaller(installerPath: string, info: UpdateInfo) {
  if (await startInstallation(installerPath)) {
    return;
  }
  const userAction = await promptInstallerOpenError();
  if (userAction === InstallerErrorChoice.RetryDownload) {
    ElectronLogger.info('User chose to retry download after installer open error');
    await startManualUpdateProcess(info);
  } else if (userAction === InstallerErrorChoice.RetryOpen) {
    ElectronLogger.info('User chose to retry opening installer');
    await openInstaller(installerPath, info);
  }
}

async function withProgressBar(
  action: (progressBar: UpdateProgressBar) => Promise<void>,
) {
  const progressBar = new UpdateProgressBar();
  await action(progressBar);
  progressBar.closeIfOpen();
}

async function isIntegrityPreserved(
  filePath: string,
  fileUrl: string,
  info: UpdateInfo,
): Promise<boolean> {
  const sha512Hash = getRemoteSha512Hash(info, fileUrl);
  if (!sha512Hash) {
    return false;
  }
  const integrityCheckResult = await checkIntegrity(filePath, sha512Hash);
  return integrityCheckResult;
}

function getRemoteSha512Hash(info: UpdateInfo, fileUrl: string): string | undefined {
  const fileInfos = info.files.filter((file) => fileUrl.includes(file.url));
  if (!fileInfos.length) {
    ElectronLogger.error('Failed to find remote hash for download URL', { url: fileUrl, files: info.files });
    if (info.files.length > 0) {
      const firstHash = info.files[0].sha512;
      ElectronLogger.info('Using first available hash due to missing match', { hash: firstHash });
      return firstHash;
    }
    return undefined;
  }
  if (fileInfos.length > 1) {
    ElectronLogger.warn('Multiple file entries found for download URL', { url: fileUrl, entries: fileInfos });
  }
  return fileInfos[0].sha512;
}

interface UpdateUrls {
  readonly releaseUrl: string;
  readonly downloadUrl: string;
}

function getRemoteUpdateUrls(targetVersion: string): UpdateUrls {
  const existingProject = parseProjectDetails();
  const targetProject = new GitHubProjectDetails(
    existingProject.name,
    new Version(targetVersion),
    existingProject.slogan,
    existingProject.repositoryUrl,
    existingProject.homepage,
  );
  return {
    releaseUrl: targetProject.releaseUrl,
    downloadUrl: targetProject.getDownloadUrl(OperatingSystem.macOS),
  };
}
