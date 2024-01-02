import { OperatingSystem } from '@/domain/OperatingSystem';

export interface RuntimeEnvironment {
  readonly isDesktop: boolean;
  readonly os: OperatingSystem | undefined;
  readonly isNonProduction: boolean;
}
