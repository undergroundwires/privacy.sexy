import { NodeElectronSystemOperations } from '@/infrastructure/CodeRunner/System/NodeElectronSystemOperations';
import type { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import type { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import type { ExecutablePermissionSetter } from './ExecutablePermissionSetter';

export class FileSystemExecutablePermissionSetter implements ExecutablePermissionSetter {
  constructor(
    private readonly system: SystemOperations = new NodeElectronSystemOperations(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async makeFileExecutable(filePath: string): Promise<ScriptFileExecutionOutcome> {
    /*
      This is required on macOS and Linux otherwise the terminal emulators will refuse to
      execute the script. It's not needed on Windows.
    */
    try {
      this.logger.info(`Setting execution permissions for file at ${filePath}`);
      await this.system.fileSystem.setFilePermissions(filePath, '755');
      this.logger.info(`Execution permissions set successfully for ${filePath}`);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: {
          type: 'FilePermissionChangeError',
          message: `Error setting script file permission: ${error.message}`,
        },
      };
    }
  }
}
