import type { Application } from '@/domain/Application/Application';

export interface ApplicationLoader {
  (): Application;
}
