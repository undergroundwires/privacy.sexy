import { ElectronEnvironmentDetector, ElectronProcessType } from '@/infrastructure/RuntimeEnvironment/Electron/ElectronEnvironmentDetector';

export class ElectronEnvironmentDetectorStub implements ElectronEnvironmentDetector {
  private isInsideElectron = true;

  public process: ElectronProcessType = 'renderer';

  public isRunningInsideElectron(): boolean {
    return this.isInsideElectron;
  }

  public determineElectronProcessType(): ElectronProcessType {
    return this.process;
  }

  public withNonElectronEnvironment(): this {
    this.isInsideElectron = false;
    return this;
  }

  public withElectronEnvironment(process: ElectronProcessType): this {
    this.isInsideElectron = true;
    this.process = process;
    return this;
  }
}
