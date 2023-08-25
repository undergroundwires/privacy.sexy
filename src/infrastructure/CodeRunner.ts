import { Environment } from '@/infrastructure/Environment/Environment';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class CodeRunner {
  constructor(
    private readonly environment = Environment.CurrentEnvironment,
  ) {
    if (!environment.system) {
      throw new Error('missing system operations');
    }
  }

  public async runCode(code: string, folderName: string, fileExtension: string): Promise<void> {
    const { system } = this.environment;
    const dir = system.location.combinePaths(
      system.operatingSystem.getTempDirectory(),
      folderName,
    );
    await system.fileSystem.createDirectory(dir, true);
    const filePath = system.location.combinePaths(dir, `run.${fileExtension}`);
    await system.fileSystem.writeToFile(filePath, code);
    await system.fileSystem.setFilePermissions(filePath, '755');
    const command = getExecuteCommand(filePath, this.environment);
    system.command.execute(command);
  }
}

function getExecuteCommand(scriptPath: string, environment: Environment): string {
  switch (environment.os) {
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
      throw Error(`unsupported os: ${OperatingSystem[environment.os]}`);
  }
}
