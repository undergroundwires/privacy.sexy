import { OperatingSystem } from '@/domain/OperatingSystem';

export interface RuntimeEnvironment {
  readonly isRunningAsDesktopApplication: boolean;
  readonly os: OperatingSystem | undefined;
  readonly isNonProduction: boolean;
}
