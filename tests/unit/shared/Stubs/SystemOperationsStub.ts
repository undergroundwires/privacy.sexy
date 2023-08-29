import {
  ICommandOps,
  IFileSystemOps,
  IOperatingSystemOps,
  ILocationOps,
  ISystemOperations,
} from '@/infrastructure/SystemOperations/ISystemOperations';
import { CommandOpsStub } from './CommandOpsStub';
import { FileSystemOpsStub } from './FileSystemOpsStub';
import { LocationOpsStub } from './LocationOpsStub';
import { OperatingSystemOpsStub } from './OperatingSystemOpsStub';

export class SystemOperationsStub implements ISystemOperations {
  public operatingSystem: IOperatingSystemOps = new OperatingSystemOpsStub();

  public location: ILocationOps = new LocationOpsStub();

  public fileSystem: IFileSystemOps = new FileSystemOpsStub();

  public command: ICommandOps = new CommandOpsStub();

  public withOperatingSystem(operatingSystemOps: IOperatingSystemOps): this {
    this.operatingSystem = operatingSystemOps;
    return this;
  }

  public withLocation(location: ILocationOps): this {
    this.location = location;
    return this;
  }

  public withFileSystem(fileSystem: IFileSystemOps): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withCommand(command: ICommandOps): this {
    this.command = command;
    return this;
  }
}
