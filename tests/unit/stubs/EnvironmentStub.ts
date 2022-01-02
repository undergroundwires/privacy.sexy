import { IEnvironment } from '@/application/Environment/IEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class EnvironmentStub implements IEnvironment {
  public isDesktop = true;

  public os = OperatingSystem.Windows;

  public withOs(os: OperatingSystem): EnvironmentStub {
    this.os = os;
    return this;
  }
}
