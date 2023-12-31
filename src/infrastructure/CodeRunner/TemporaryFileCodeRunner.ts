import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/application/CodeRunner';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '../Log/ElectronLogger';
import { SystemOperations } from './SystemOperations/SystemOperations';
import { createNodeSystemOperations } from './SystemOperations/NodeSystemOperations';
import { generateOsTimestampedFileName } from './FileNameGenerator';

export type FileNameGenerator = (os: OperatingSystem) => string;

export class TemporaryFileCodeRunner implements CodeRunner {
  constructor(
    private readonly system: SystemOperations = createNodeSystemOperations(),
    private readonly fileNameGenerator: FileNameGenerator = generateOsTimestampedFileName,
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async runCode(
    code: string,
    tempScriptFolderName: string,
    os: OperatingSystem,
  ): Promise<void> {
    this.logger.info(`Starting running code for OS: ${OperatingSystem[os]}`);
    try {
      const fileName = this.fileNameGenerator(os);
      const filePath = await this.createTemporaryFile(fileName, tempScriptFolderName, code);
      await this.executeFile(filePath, os);
      this.logger.info(`Successfully executed script at ${filePath}`);
    } catch (error) {
      this.logger.error(`Error executing script: ${error.message}`, error);
      throw error;
    }
  }

  private async createTemporaryFile(
    fileName: string,
    tempScriptFolderName: string,
    contents: string,
  ): Promise<string> {
    const directoryPath = this.system.location.combinePaths(
      this.system.operatingSystem.getTempDirectory(),
      tempScriptFolderName,
    );
    await this.createDirectoryIfNotExists(directoryPath);
    const filePath = this.system.location.combinePaths(directoryPath, fileName);
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

  private async executeFile(filePath: string, os: OperatingSystem): Promise<void> {
    await this.setFileExecutablePermissions(filePath);
    const command = getExecuteCommand(filePath, os);
    await this.executeCommand(command);
  }

  private async setFileExecutablePermissions(filePath: string): Promise<void> {
    this.logger.info(`Setting execution permissions for file at ${filePath}`);
    await this.system.fileSystem.setFilePermissions(filePath, '755');
    this.logger.info(`Execution permissions set successfully for ${filePath}`);
  }

  private async executeCommand(command: string): Promise<void> {
    this.logger.info(`Executing command: ${command}`);
    await this.system.command.execute(command);
    this.logger.info('Command executed successfully.');
  }
}

function getExecuteCommand(
  scriptPath: string,
  os: OperatingSystem,
): string {
  switch (os) {
    case OperatingSystem.Linux:
      return `x-terminal-emulator -e '${scriptPath}'`;
    case OperatingSystem.macOS:
      return `open -a Terminal.app ${scriptPath}`;
    // Another option with graphical sudo would be
    //  `osascript -e "do shell script \\"${scriptPath}\\" with administrator privileges"`
    // However it runs in background
    case OperatingSystem.Windows:
      return scriptPath;
    default:
      throw Error(`unsupported os: ${OperatingSystem[os]}`);
  }
}
