import type { Application } from '@/domain/Application/Application';

export interface IApplicationFactory {
  getApp(): Promise<Application>;
}
