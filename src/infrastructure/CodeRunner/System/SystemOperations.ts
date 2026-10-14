import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';

export interface SystemOperations {
  readonly fileSystem: FileSystemOperations;
  readonly command: CommandOps;
}

export interface CommandOps {
  exec(command: string): CommandProcess;
}

export interface CommandProcess {
  on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}
