import type { Logger } from '@/application/Common/Log/Logger';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import { PersistentApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/PersistentApplicationDirectoryProvider';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import { NodeElectronFileSystemOperations } from '@/infrastructure/FileSystem/NodeElectronFileSystemOperations';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { retryFileSystemAccess, type FileSystemAccessorWithRetry } from '../FileSystemAccessorWithRetry';

export interface InstallationFilepathProvider {
  (
    version: string,
    utilities?: InstallationFilepathProviderUtilities,
  ): Promise<string>;
}

interface InstallationFilepathProviderUtilities {
  readonly logger: Logger;
  readonly directoryProvider: ApplicationDirectoryProvider;
  readonly fileSystem: FileSystemOperations;
  readonly accessFileSystemWithRetry: FileSystemAccessorWithRetry;
}

export const InstallerFileSuffix = '-installer.dmg';

export const provideUpdateInstallationFilepath: InstallationFilepathProvider = async (
  version,
  utilities = DefaultUtilities,
) => {
  const {
    success, error, directoryAbsolutePath,
  } = await utilities.directoryProvider.provideDirectory('update-installation-files');
  if (!success) {
    utilities.logger.error('Error when providing download directory', error);
    throw new Error('Failed to provide download directory.');
  }
  const filepath = utilities.fileSystem.combinePaths(directoryAbsolutePath, `${version}${InstallerFileSuffix}`);
  if (!await makeFilepathAvailable(filepath, utilities)) {
    throw new Error(`Failed to prepare the file path for the installer: ${filepath}`);
  }
  return filepath;
};

async function makeFilepathAvailable(
  filePath: string,
  utilities: InstallationFilepathProviderUtilities,
): Promise<boolean> {
  let isFileAvailable = false;
  try {
    isFileAvailable = await utilities.fileSystem.isFileAvailable(filePath);
  } catch (error) {
    throw new Error('File availability check failed');
  }
  if (!isFileAvailable) {
    return true;
  }
  return utilities.accessFileSystemWithRetry(async () => {
    try {
      utilities.logger.info(`Existing update file found and will be replaced: ${filePath}`);
      await utilities.fileSystem.deletePath(filePath);
      return true;
    } catch (error) {
      utilities.logger.error(`Failed to prepare file path for update: ${filePath}`, error);
      return false;
    }
  });
}

const DefaultUtilities: InstallationFilepathProviderUtilities = {
  logger: ElectronLogger,
  directoryProvider: new PersistentApplicationDirectoryProvider(),
  fileSystem: NodeElectronFileSystemOperations,
  accessFileSystemWithRetry: retryFileSystemAccess,
};
