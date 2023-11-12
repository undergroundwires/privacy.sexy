import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/SystemOperations/ISystemOperations';
import { ILogger } from '@/infrastructure/Log/ILogger';

/* Primary entry point for platform-specific injections */
export interface WindowVariables {
  readonly isDesktop?: boolean;
  readonly system?: ISystemOperations;
  readonly os?: OperatingSystem;
  readonly log?: ILogger;
}
