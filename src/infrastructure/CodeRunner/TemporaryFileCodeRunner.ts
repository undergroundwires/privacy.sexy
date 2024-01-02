import { CodeRunner } from '@/application/CodeRunner';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '../Log/ElectronLogger';
import { SystemOperations } from './SystemOperations/SystemOperations';
import { createNodeSystemOperations } from './SystemOperations/NodeSystemOperations';
import { FilenameGenerator } from './Filename/FilenameGenerator';
import { ScriptFileExecutor } from './Execution/ScriptFileExecutor';
import { VisibleTerminalScriptExecutor } from './Execution/VisibleTerminalScriptFileExecutor';
import { OsTimestampedFilenameGenerator } from './Filename/OsTimestampedFilenameGenerator';

export class TemporaryFileCodeRunner implements CodeRunner {
  constructor(
    private readonly system: SystemOperations = createNodeSystemOperations(),
    private readonly filenameGenerator: FilenameGenerator = new OsTimestampedFilenameGenerator(),
    private readonly logger: Logger = ElectronLogger,
    private readonly scriptFileExecutor: ScriptFileExecutor = new VisibleTerminalScriptExecutor(),
  ) { }

  public async runCode(
    code: string,
    tempScriptFolderName: string,
  ): Promise<void> {
    this.logger.info('Starting running code.');
    try {
      const filename = this.filenameGenerator.generateFilename();
      const filePath = await this.createTemporaryFile(filename, tempScriptFolderName, code);
      await this.scriptFileExecutor.executeScriptFile(filePath);
      this.logger.info(`Successfully executed script at ${filePath}`);
    } catch (error) {
      this.logger.error(`Error executing script: ${error.message}`, error);
      throw error;
    }
  }

  private async createTemporaryFile(
    filename: string,
    tempScriptFolderName: string,
    contents: string,
  ): Promise<string> {
    const directoryPath = this.system.location.combinePaths(
      this.system.operatingSystem.getTempDirectory(),
      tempScriptFolderName,
    );
    await this.createDirectoryIfNotExists(directoryPath);
    const filePath = this.system.location.combinePaths(directoryPath, filename);
    await this.createFile(filePath, contents);
    return filePath;
  }

  private async createFile(filePath: string, contents: string): Promise<void> {
    this.logger.info(`Creating file at ${filePath}, size: ${contents.length} characters`);
    await this.system.fileSystem.writeToFile(filePath, contents);
    this.logger.info(`File created successfully at ${filePath}`);
  }

  private async createDirectoryIfNotExists(directoryPath: string): Promise<void> {
    this.logger.info(`Checking and ensuring directory exists: ${directoryPath}`);
    await this.system.fileSystem.createDirectory(directoryPath, true);
    this.logger.info(`Directory confirmed at: ${directoryPath}`);
  }
}
