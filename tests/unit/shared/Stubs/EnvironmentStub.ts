import { IEnvironment } from '@/infrastructure/Environment/IEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';
import { SystemOperationsStub } from './SystemOperationsStub';

export class EnvironmentStub implements IEnvironment {
  public isDesktop = true;

  public os = OperatingSystem.Windows;

  public system: ISystemOperations = new SystemOperationsStub();

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withSystemOperations(system: ISystemOperations): this {
    this.system = system;
    return this;
  }
}
