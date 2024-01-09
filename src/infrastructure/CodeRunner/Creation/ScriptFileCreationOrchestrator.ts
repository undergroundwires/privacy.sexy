import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { SystemOperations } from '../System/SystemOperations';
import { NodeElectronSystemOperations } from '../System/NodeElectronSystemOperations';
import { FilenameGenerator } from './Filename/FilenameGenerator';
import { ScriptFileNameParts, ScriptFileCreator } from './ScriptFileCreator';
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
    scriptFileNameParts: ScriptFileNameParts,
  ): Promise<string> {
    const filePath = await this.provideFilePath(scriptFileNameParts);
    await this.createFile(filePath, contents);
    return filePath;
  }

  private async provideFilePath(scriptFileNameParts: ScriptFileNameParts): Promise<string> {
    const filename = this.filenameGenerator.generateFilename(scriptFileNameParts);
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
