import type { Application } from '@/domain/Application';

export interface ApplicationProvider { // TODO: Use another name than factory?
  (): Promise<Application>;
}
