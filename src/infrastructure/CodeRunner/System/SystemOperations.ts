import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import type { exec } from 'node:child_process';

export interface SystemOperations {
  readonly fileSystem: FileSystemOperations;
  readonly command: CommandOps;
}

export interface CommandOps {
  exec(command: string): ReturnType<typeof exec>;
}
