import { OperatingSystem } from '@/domain/OperatingSystem';

export interface CodeRunner {
  runCode(
    code: string, folderName: string, fileExtension: string, os: OperatingSystem,
  ): Promise<void>;
}
