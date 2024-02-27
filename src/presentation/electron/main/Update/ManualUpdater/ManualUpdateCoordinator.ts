import { shell } from 'electron';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { GitHubProjectDetails } from '@/domain/Project/GitHubProjectDetails';
import { Version } from '@/domain/Version';
import { parseProjectDetails } from '@/application/Parser/ProjectDetailsParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { UpdateProgressBar } from '../UpdateProgressBar';
import {
  promptForManualUpdate, promptInstallerOpenError,
  promptIntegrityCheckFailure, promptDownloadError,
  DownloadErrorChoice, InstallerErrorChoice, IntegrityCheckChoice,
  ManualUpdateChoice, showUnexpectedError, UnexpectedErrorChoice,
} from './Dialogs';
import { type DownloadUpdateResult, downloadUpdate } from './Downloader';
import { checkIntegrity } from './Integrity';
import { startInstallation } from './Installer';
import type { UpdateInfo } from 'electron-updater';

export function requiresManualUpdate(): boolean {
  return process.platform === 'darwin';
}

export async function startManualUpdateProcess(info: UpdateInfo) {
  try {
    const updateAction = await promptForManualUpdate();
    if (updateAction === ManualUpdateChoice.NoAction) {
      ElectronLogger.info('User cancelled the update.');
      return;
    }
    const { releaseUrl, downloadUrl } = getRemoteUpdateUrls(info.version);
    if (updateAction === ManualUpdateChoice.VisitReleasesPage) {
      ElectronLogger.info(`Navigating to release page: ${releaseUrl}`);
      await shell.openExternal(releaseUrl);
    } else if (updateAction === ManualUpdateChoice.UpdateNow) {
      ElectronLogger.info('Initiating update download and installation.');
      await downloadAndInstallUpdate(downloadUrl, info);
    }
  } catch (err) {
    ElectronLogger.error('Unexpected error during updates', err);
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
    await startManualUpdateProcess(info);
  } else if (userAction === IntegrityCheckChoice.ContinueAnyway) {
    ElectronLogger.warn('Proceeding to install with failed integrity check.');
    await openInstaller(download.installerPath, info);
  }
}

async function handleFailedDownload(info: UpdateInfo) {
  const userAction = await promptDownloadError();
  if (userAction === DownloadErrorChoice.Cancel) {
    ElectronLogger.info('Update download canceled.');
  } else if (userAction === DownloadErrorChoice.RetryDownload) {
    ElectronLogger.info('Retrying update download.');
    await startManualUpdateProcess(info);
  }
}

async function handleUnexpectedError(info: UpdateInfo) {
  const userAction = await showUnexpectedError();
  if (userAction === UnexpectedErrorChoice.Cancel) {
    ElectronLogger.info('Unexpected error handling canceled.');
  } else if (userAction === UnexpectedErrorChoice.RetryUpdate) {
    ElectronLogger.info('Retrying the update process.');
    await startManualUpdateProcess(info);
  }
}

async function openInstaller(installerPath: string, info: UpdateInfo) {
  if (await startInstallation(installerPath)) {
    return;
  }
  const userAction = await promptInstallerOpenError();
  if (userAction === InstallerErrorChoice.RetryDownload) {
    await startManualUpdateProcess(info);
  } else if (userAction === InstallerErrorChoice.RetryOpen) {
    await openInstaller(installerPath, info);
  }
}

async function withProgressBar(
  action: (progressBar: UpdateProgressBar) => Promise<void>,
) {
  const progressBar = new UpdateProgressBar();
  await action(progressBar);
  progressBar.close();
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
    ElectronLogger.error(`Remote hash not found for the URL: ${fileUrl}`, info.files);
    if (info.files.length > 0) {
      const firstHash = info.files[0].sha512;
      ElectronLogger.info(`Selecting the first available hash: ${firstHash}`);
      return firstHash;
    }
    return undefined;
  }
  if (fileInfos.length > 1) {
    ElectronLogger.error(`Found multiple file entries for the URL: ${fileUrl}`, fileInfos);
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
