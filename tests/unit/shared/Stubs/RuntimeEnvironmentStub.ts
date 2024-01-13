import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class RuntimeEnvironmentStub implements RuntimeEnvironment {
  public isNonProduction = true;

  public isRunningAsDesktopApplication = false;

  public os: OperatingSystem | undefined = OperatingSystem.Windows;

  public withOs(os: OperatingSystem | undefined): this {
    this.os = os;
    return this;
  }

  public withIsRunningAsDesktopApplication(isRunningAsDesktopApplication: boolean): this {
    this.isRunningAsDesktopApplication = isRunningAsDesktopApplication;
    return this;
  }

  public withIsNonProduction(isNonProduction: boolean): this {
    this.isNonProduction = isNonProduction;
    return this;
  }
}
