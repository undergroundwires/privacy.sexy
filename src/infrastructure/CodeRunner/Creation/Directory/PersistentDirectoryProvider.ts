import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { SystemOperations } from '../../System/SystemOperations';
import { NodeElectronSystemOperations } from '../../System/NodeElectronSystemOperations';
import { ScriptDirectoryProvider } from './ScriptDirectoryProvider';

export const ExecutionSubdirectory = 'runs';

export class PersistentDirectoryProvider implements ScriptDirectoryProvider {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  async provideScriptDirectory(): Promise<string> {
    const scriptsDirectory = this.system.location.combinePaths(
      /*
        Switched from temporary to persistent directory for script storage for improved reliability.

        Temporary directories in some environments, such certain Windows Pro Azure VMs, showed
        issues where scripts were interrupted due to directory cleanup during script execution.
        This was observed with system temp directories (e.g., `%LOCALAPPDATA%\Temp`).

        Persistent directories offer better stability during long executions and aid in auditability
        and troubleshooting.
      */
      this.system.operatingSystem.getUserDataDirectory(),
      ExecutionSubdirectory,
    );
    this.logger.info(`Attempting to create script directory at path: ${scriptsDirectory}`);
    try {
      await this.system.fileSystem.createDirectory(scriptsDirectory, true);
      this.logger.info(`Script directory successfully created at: ${scriptsDirectory}`);
    } catch (error) {
      this.logger.error(`Error creating script directory at ${scriptsDirectory}: ${error.message}`, error);
      throw error;
    }
    return scriptsDirectory;
  }
}
