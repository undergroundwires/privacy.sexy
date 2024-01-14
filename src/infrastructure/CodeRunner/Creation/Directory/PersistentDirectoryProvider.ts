import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { CodeRunError, CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { SystemOperations } from '../../System/SystemOperations';
import { NodeElectronSystemOperations } from '../../System/NodeElectronSystemOperations';
import { ScriptDirectoryOutcome, ScriptDirectoryProvider } from './ScriptDirectoryProvider';

export const ExecutionSubdirectory = 'runs';

/**
 * Provides a dedicated directory for script execution.
 * Benefits of using a persistent directory:
 * - Antivirus Exclusions: Easier antivirus configuration.
 * - Auditability: Stores script execution history for troubleshooting.
 * - Reliability: Avoids issues with directory clean-ups during execution,
 *   seen in Windows Pro Azure VMs when stored on Windows temporary directory.
 */
export class PersistentDirectoryProvider implements ScriptDirectoryProvider {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async provideScriptDirectory(): Promise<ScriptDirectoryOutcome> {
    const {
      success: isPathConstructed,
      error: pathConstructionError,
      directoryPath,
    } = this.constructScriptDirectoryPath();
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
      await this.system.fileSystem.createDirectory(directoryPath, true);
      this.logger.info(`Script directory successfully created at: ${directoryPath}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleException(error, 'DirectoryCreationError'),
      };
    }
  }

  private constructScriptDirectoryPath(): DirectoryPathConstructionOutcome {
    try {
      const parentDirectory = this.system.operatingSystem.getUserDataDirectory();
      const scriptDirectory = this.system.location.combinePaths(
        parentDirectory,
        ExecutionSubdirectory,
      );
      return {
        success: true,
        directoryPath: scriptDirectory,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleException(error, 'DirectoryCreationError'),
      };
    }
  }

  private handleException(
    exception: Error,
    errorType: CodeRunErrorType,
  ): CodeRunError {
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
  readonly error: CodeRunError;
  readonly directoryPath?: undefined;
} | {
  readonly success: true;
  readonly directoryPath: string;
  readonly error?: undefined;
};

type DirectoryPathCreationOutcome = {
  readonly success: false;
  readonly error: CodeRunError;
} | {
  readonly success: true;
  readonly error?: undefined;
};
