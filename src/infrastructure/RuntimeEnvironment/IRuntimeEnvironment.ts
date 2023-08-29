import { OperatingSystem } from '@/domain/OperatingSystem';

export interface IRuntimeEnvironment {
  readonly isDesktop: boolean;
  readonly os: OperatingSystem | undefined;
  readonly isNonProduction: boolean;
}
