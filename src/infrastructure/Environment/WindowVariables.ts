import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISystemOperations } from './SystemOperations/ISystemOperations';

export type WindowVariables = {
  system: ISystemOperations;
  isDesktop: boolean;
  os: OperatingSystem;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends WindowVariables { }
}
