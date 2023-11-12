import { IRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/IRuntimeEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class RuntimeEnvironmentStub implements IRuntimeEnvironment {
  public isNonProduction = true;

  public isDesktop = true;

  public os: OperatingSystem | undefined = OperatingSystem.Windows;

  public withOs(os: OperatingSystem | undefined): this {
    this.os = os;
    return this;
  }

  public withIsDesktop(isDesktop: boolean): this {
    this.isDesktop = isDesktop;
    return this;
  }

  public withIsNonProduction(isNonProduction: boolean): this {
    this.isNonProduction = isNonProduction;
    return this;
  }
}
