import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { SystemOperations } from '../System/SystemOperations';
import { NodeElectronSystemOperations } from '../System/NodeElectronSystemOperations';
import { FilenameGenerator } from './Filename/FilenameGenerator';
import { ScriptFileCreator } from './ScriptFileCreator';
import { OsTimestampedFilenameGenerator } from './Filename/OsTimestampedFilenameGenerator';
import { ScriptDirectoryProvider } from './Directory/ScriptDirectoryProvider';
import { PersistentDirectoryProvider } from './Directory/PersistentDirectoryProvider';

export class ScriptFileCreationOrchestrator implements ScriptFileCreator {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly filenameGenerator: FilenameGenerator = new OsTimestampedFilenameGenerator(),
    private readonly directoryProvider: ScriptDirectoryProvider = new PersistentDirectoryProvider(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async createScriptFile(contents: string): Promise<string> {
    const filePath = await this.provideFilePath();
    await this.createFile(filePath, contents);
    return filePath;
  }

  private async provideFilePath(): Promise<string> {
    const filename = this.filenameGenerator.generateFilename();
    const directoryPath = await this.directoryProvider.provideScriptDirectory();
    const filePath = this.system.location.combinePaths(directoryPath, filename);
    return filePath;
  }

  private async createFile(filePath: string, contents: string): Promise<void> {
    this.logger.info(`Creating file at ${filePath}, size: ${contents.length} characters`);
    await this.system.fileSystem.writeToFile(filePath, contents);
    this.logger.info(`File created successfully at ${filePath}`);
  }
}
