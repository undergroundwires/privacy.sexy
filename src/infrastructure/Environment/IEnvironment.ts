import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';

export interface IEnvironment {
  readonly isDesktop: boolean;
  readonly os: OperatingSystem | undefined;
  readonly system: ISystemOperations | undefined;
}
