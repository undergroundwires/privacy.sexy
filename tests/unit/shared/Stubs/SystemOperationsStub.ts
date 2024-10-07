import type {
  CommandOps,
  SystemOperations,
} from '@/infrastructure/CodeRunner/System/SystemOperations';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import { CommandOpsStub } from './CommandOpsStub';
import { FileSystemOperationsStub } from './FileSystemOperationsStub';

export class SystemOperationsStub implements SystemOperations {
  public fileSystem: FileSystemOperations = new FileSystemOperationsStub();

  public command: CommandOps = new CommandOpsStub();

  public withFileSystem(fileSystem: FileSystemOperations): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withCommand(command: CommandOps): this {
    this.command = command;
    return this;
  }
}
