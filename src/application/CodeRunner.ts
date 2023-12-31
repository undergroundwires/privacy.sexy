import { OperatingSystem } from '@/domain/OperatingSystem';

export interface CodeRunner {
  runCode(
    code: string,
    tempScriptFolderName: string,
    os: OperatingSystem,
  ): Promise<void>;
}
