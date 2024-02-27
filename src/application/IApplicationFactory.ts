import type { IApplication } from '@/domain/IApplication';

export interface IApplicationFactory {
  getApp(): Promise<IApplication>;
}
