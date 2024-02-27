import type { IAppMetadata } from './IAppMetadata';

/**
 * Designed to decouple the process of retrieving environment variables
 * (e.g., from the build environment) from the rest of the application.
 */
export interface IEnvironmentVariables extends IAppMetadata {
  readonly isNonProduction: boolean;
}
