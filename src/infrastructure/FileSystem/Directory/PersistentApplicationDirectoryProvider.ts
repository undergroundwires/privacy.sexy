import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { NodeElectronFileSystemOperations } from '@/infrastructure/FileSystem/NodeElectronFileSystemOperations';
import type {
  DirectoryCreationOutcome, ApplicationDirectoryProvider, DirectoryType,
  DirectoryCreationError, DirectoryCreationErrorType,
} from './ApplicationDirectoryProvider';
import type { FileSystemOperations } from '../FileSystemOperations';

export const SubdirectoryNames: Record<DirectoryType, string> = {
  'script-runs': 'runs',
  'update-installation-files': 'updates',
};

/**
 * Provides persistent directories.
 * Benefits of using a persistent directory:
 * - Antivirus Exclusions: Easier antivirus configuration.
 * - Auditability: Stores script execution history for troubleshooting.
 * - Reliability: Avoids issues with directory clean-ups during execution,
 *   seen in Windows Pro Azure VMs when stored on Windows temporary directory.
 */
export class PersistentApplicationDirectoryProvider implements ApplicationDirectoryProvider {
  constructor(
    private readonly fileSystem: FileSystemOperations = NodeElectronFileSystemOperations,
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async provideDirectory(type: DirectoryType): Promise<DirectoryCreationOutcome> {
    const {
      success: isPathConstructed,
      error: pathConstructionError,
      directoryPath,
    } = this.constructScriptDirectoryPath(type);
    if (!isPathConstructed) {
      return {
        success: false,
        error: pathConstructionError,
      };
    }
    const {
      success: isDirectoryCreated,
      error: directoryCreationError,
    } = await this.createDirectory(directoryPath);
    if (!isDirectoryCreated) {
      return {
        success: false,
        error: directoryCreationError,
      };
    }
    return {
      success: true,
      directoryAbsolutePath: directoryPath,
    };
  }

  private async createDirectory(directoryPath: string): Promise<DirectoryPathCreationOutcome> {
    try {
      this.logger.info(`Attempting to create script directory at path: ${directoryPath}`);
      await this.fileSystem.createDirectory(directoryPath, true);
      this.logger.info(`Script directory successfully created at: ${directoryPath}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'DirectoryWriteError'),
      };
    }
  }

  private constructScriptDirectoryPath(type: DirectoryType): DirectoryPathConstructionOutcome {
    let parentDirectory: string;
    try {
      parentDirectory = this.fileSystem.getUserDataDirectory();
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'UserDataFolderRetrievalError'),
      };
    }
    try {
      const subdirectoryName = SubdirectoryNames[type];
      const scriptDirectory = this.fileSystem.combinePaths(
        parentDirectory,
        subdirectoryName,
      );
      return {
        success: true,
        directoryPath: scriptDirectory,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'PathConstructionError'),
      };
    }
  }

  private handleError(
    exception: Error,
    errorType: DirectoryCreationErrorType,
  ): DirectoryCreationError {
    const errorMessage = 'Error during script directory creation';
    this.logger.error(errorType, errorMessage, exception);
    return {
      type: errorType,
      message: `${errorMessage}: ${exception.message}`,
    };
  }
}

type DirectoryPathConstructionOutcome = {
  readonly success: false;
  readonly error: DirectoryCreationError;
  readonly directoryPath?: undefined;
} | {
  readonly success: true;
  readonly directoryPath: string;
  readonly error?: undefined;
};

type DirectoryPathCreationOutcome = {
  readonly success: false;
  readonly error: DirectoryCreationError;
} | {
  readonly success: true;
  readonly error?: undefined;
};
