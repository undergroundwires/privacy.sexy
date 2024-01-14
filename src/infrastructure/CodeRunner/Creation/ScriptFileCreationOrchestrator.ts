import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { CodeRunError, CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { SystemOperations } from '../System/SystemOperations';
import { NodeElectronSystemOperations } from '../System/NodeElectronSystemOperations';
import { FilenameGenerator } from './Filename/FilenameGenerator';
import { ScriptFilenameParts, ScriptFileCreator, ScriptFileCreationOutcome } from './ScriptFileCreator';
import { TimestampedFilenameGenerator } from './Filename/TimestampedFilenameGenerator';
import { ScriptDirectoryProvider } from './Directory/ScriptDirectoryProvider';
import { PersistentDirectoryProvider } from './Directory/PersistentDirectoryProvider';

export class ScriptFileCreationOrchestrator implements ScriptFileCreator {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly filenameGenerator: FilenameGenerator = new TimestampedFilenameGenerator(),
    private readonly directoryProvider: ScriptDirectoryProvider = new PersistentDirectoryProvider(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async createScriptFile(
    contents: string,
    scriptFilenameParts: ScriptFilenameParts,
  ): Promise<ScriptFileCreationOutcome> {
    const {
      success: isDirectoryCreated, error: directoryCreationError, directoryAbsolutePath,
    } = await this.directoryProvider.provideScriptDirectory();
    if (!isDirectoryCreated) {
      return createFailure(directoryCreationError);
    }
    const {
      success: isFilePathConstructed, error: filePathGenerationError, filePath,
    } = this.constructFilePath(scriptFilenameParts, directoryAbsolutePath);
    if (!isFilePathConstructed) {
      return createFailure(filePathGenerationError);
    }
    const {
      success: isFileCreated, error: fileCreationError,
    } = await this.writeFile(filePath, contents);
    if (!isFileCreated) {
      return createFailure(fileCreationError);
    }
    return {
      success: true,
      scriptFileAbsolutePath: filePath,
    };
  }

  private constructFilePath(
    scriptFilenameParts: ScriptFilenameParts,
    directoryPath: string,
  ): FilePathConstructionOutcome {
    try {
      const filename = this.filenameGenerator.generateFilename(scriptFilenameParts);
      const filePath = this.system.location.combinePaths(directoryPath, filename);
      return { success: true, filePath };
    } catch (error) {
      return {
        success: false,
        error: this.handleException(error, 'FilePathGenerationError'),
      };
    }
  }

  private async writeFile(
    filePath: string,
    contents: string,
  ): Promise<FileWriteOutcome> {
    try {
      this.logger.info(`Creating file at ${filePath}, size: ${contents.length} characters`);
      await this.system.fileSystem.writeToFile(filePath, contents);
      this.logger.info(`File created successfully at ${filePath}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.handleException(error, 'FileWriteError'),
      };
    }
  }

  private handleException(
    exception: Error,
    errorType: CodeRunErrorType,
  ): CodeRunError {
    const errorMessage = 'Error during script file operation';
    this.logger.error(errorType, errorMessage, exception);
    return {
      type: errorType,
      message: `${errorMessage}: ${exception.message}`,
    };
  }
}

function createFailure(error: CodeRunError): ScriptFileCreationOutcome {
  return {
    success: false,
    error,
  };
}

type FileWriteOutcome = {
  readonly success: true;
  readonly error?: undefined;
} | {
  readonly success: false;
  readonly error: CodeRunError;
};

type FilePathConstructionOutcome = {
  readonly success: true;
  readonly filePath: string;
  readonly error?: undefined;
} | {
  readonly success: false;
  readonly filePath?: undefined;
  readonly error: CodeRunError;
};
