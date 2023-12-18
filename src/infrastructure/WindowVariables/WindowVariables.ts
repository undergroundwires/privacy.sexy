import { OperatingSystem } from '@/domain/OperatingSystem';
import { Logger } from '@/application/Common/Log/Logger';
import { CodeRunner } from '@/application/CodeRunner';

/* Primary entry point for platform-specific injections */
export interface WindowVariables {
  readonly isDesktop: boolean;
  readonly codeRunner?: CodeRunner;
  readonly os?: OperatingSystem;
  readonly log: Logger;
}
