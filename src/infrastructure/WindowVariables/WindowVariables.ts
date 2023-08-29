import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/SystemOperations/ISystemOperations';
import { ILogger } from '@/infrastructure/Log/ILogger';

/* Primary entry point for platform-specific injections */
export interface WindowVariables {
  readonly system: ISystemOperations;
  readonly isDesktop: boolean;
  readonly os: OperatingSystem;
  readonly log: ILogger;
}
