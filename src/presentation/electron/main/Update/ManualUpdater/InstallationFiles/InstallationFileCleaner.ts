import type { Logger } from '@/application/Common/Log/Logger';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { PersistentApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/PersistentApplicationDirectoryProvider';
import { NodeElectronFileSystemOperations } from '@/infrastructure/FileSystem/NodeElectronFileSystemOperations';

export interface InstallationFileCleaner {
  (
    utilities?: UpdateFileUtilities,
  ): Promise<void>;
}

interface UpdateFileUtilities {
  readonly logger: Logger;
  readonly directoryProvider: ApplicationDirectoryProvider;
  readonly fileSystem: FileSystemOperations;
}

export const clearUpdateInstallationFiles: InstallationFileCleaner = async (
  utilities = DefaultUtilities,
) => {
  utilities.logger.info('Starting update installation files cleanup');
  const { success, error, directoryAbsolutePath } = await utilities.directoryProvider.provideDirectory('update-installation-files');
  if (!success) {
    utilities.logger.error('Failed to locate installation files directory', { error });
    throw new Error('Cannot locate the installation files directory path');
  }
  const installationFileNames = await readDirectoryContents(directoryAbsolutePath, utilities);
  if (installationFileNames.length === 0) {
    utilities.logger.info('No update installation files found');
    return;
  }
  utilities.logger.debug(`Found ${installationFileNames.length} installation files to delete`);
  utilities.logger.info('Deleting installation files');
  const errors = await executeIndependentTasksAndCollectErrors(
    installationFileNames.map(async (fileOrFolderName) => {
      await deleteItemFromDirectory(directoryAbsolutePath, fileOrFolderName, utilities);
    }),
  );
  if (errors.length > 0) {
    utilities.logger.error('Failed to delete some installation files', { errors });
    throw new Error(`Failed to delete some items:\n${errors.join('\n')}`);
  }
  utilities.logger.info('Update installation files cleanup completed successfully');
};

async function deleteItemFromDirectory(
  directoryPath: string,
  fileOrFolderName: string,
  utilities: UpdateFileUtilities,
): Promise<void> {
  const itemPath = utilities.fileSystem.combinePaths(
    directoryPath,
    fileOrFolderName,
  );
  try {
    utilities.logger.debug(`Deleting installation artifact: ${itemPath}`);
    await utilities.fileSystem.deletePath(itemPath);
    utilities.logger.debug(`Successfully deleted installation artifact: ${itemPath}`);
  } catch (error) {
    utilities.logger.error(`Failed to delete installation artifact: ${itemPath}`, { error });
    throw error;
  }
}

async function readDirectoryContents(
  directoryPath: string,
  utilities: UpdateFileUtilities,
): Promise<string[]> {
  try {
    utilities.logger.debug(`Reading directory contents: ${directoryPath}`);
    const items = await utilities.fileSystem.listDirectoryContents(directoryPath);
    utilities.logger.debug(`Read ${items.length} items from directory: ${directoryPath}`);
    return items;
  } catch (error) {
    utilities.logger.error('Failed to read directory contents', { directoryPath, error });
    throw new Error('Failed to read directory contents', { cause: error });
  }
}

async function executeIndependentTasksAndCollectErrors(
  tasks: (Promise<void>)[],
): Promise<string[]> {
  const results = await Promise.allSettled(tasks);
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason);
  return errors.map((error) => {
    if (!error) {
      return 'unknown error';
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return String(error);
  });
}

const DefaultUtilities: UpdateFileUtilities = {
  logger: ElectronLogger,
  directoryProvider: new PersistentApplicationDirectoryProvider(),
  fileSystem: NodeElectronFileSystemOperations,
};
