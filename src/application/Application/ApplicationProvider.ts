import type { Application } from '@/domain/Application/Application';

/**
 * Provides centralized access to interact with application state and data.
 */
export interface ApplicationProvider {
  (): Promise<Application>;
}
