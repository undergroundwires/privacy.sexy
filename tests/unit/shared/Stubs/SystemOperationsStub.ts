import type {
  CommandOps,
  FileSystemOps,
  OperatingSystemOps,
  LocationOps,
  SystemOperations,
} from '@/infrastructure/CodeRunner/System/SystemOperations';
import { CommandOpsStub } from './CommandOpsStub';
import { FileSystemOpsStub } from './FileSystemOpsStub';
import { LocationOpsStub } from './LocationOpsStub';
import { OperatingSystemOpsStub } from './OperatingSystemOpsStub';

export class SystemOperationsStub implements SystemOperations {
  public operatingSystem: OperatingSystemOps = new OperatingSystemOpsStub();

  public location: LocationOps = new LocationOpsStub();

  public fileSystem: FileSystemOps = new FileSystemOpsStub();

  public command: CommandOps = new CommandOpsStub();

  public withOperatingSystem(operatingSystemOps: OperatingSystemOps): this {
    this.operatingSystem = operatingSystemOps;
    return this;
  }

  public withLocation(location: LocationOps): this {
    this.location = location;
    return this;
  }

  public withFileSystem(fileSystem: FileSystemOps): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withCommand(command: CommandOps): this {
    this.command = command;
    return this;
  }
}
