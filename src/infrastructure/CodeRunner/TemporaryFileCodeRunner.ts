import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/application/CodeRunner';
import { SystemOperations } from './SystemOperations/SystemOperations';
import { createNodeSystemOperations } from './SystemOperations/NodeSystemOperations';

export class TemporaryFileCodeRunner implements CodeRunner {
  constructor(
    private readonly system: SystemOperations = createNodeSystemOperations(),
  ) { }

  public async runCode(
    code: string,
    folderName: string,
    fileExtension: string,
    os: OperatingSystem,
  ): Promise<void> {
    const dir = this.system.location.combinePaths(
      this.system.operatingSystem.getTempDirectory(),
      folderName,
    );
    await this.system.fileSystem.createDirectory(dir, true);
    const filePath = this.system.location.combinePaths(dir, `run.${fileExtension}`);
    await this.system.fileSystem.writeToFile(filePath, code);
    await this.system.fileSystem.setFilePermissions(filePath, '755');
    const command = getExecuteCommand(filePath, os);
    await this.system.command.execute(command);
  }
}

function getExecuteCommand(
  scriptPath: string,
  currentOperatingSystem: OperatingSystem,
): string {
  switch (currentOperatingSystem) {
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
      throw Error(`unsupported os: ${OperatingSystem[currentOperatingSystem]}`);
  }
}
