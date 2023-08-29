import { IEnvironmentVariables } from '../IEnvironmentVariables';

/**
 * Provides the application's environment variables.
 */
export class ViteEnvironmentVariables implements IEnvironmentVariables {
  // Ensure the use of import.meta.env prefix for the following properties.
  // Vue will replace these statically during production builds.

  public get version(): string {
    return import.meta.env.VITE_APP_VERSION;
  }

  public get name(): string {
    return import.meta.env.VITE_APP_NAME;
  }

  public get slogan(): string {
    return import.meta.env.VITE_APP_SLOGAN;
  }

  public get repositoryUrl(): string {
    return import.meta.env.VITE_APP_REPOSITORY_URL;
  }

  public get homepageUrl(): string {
    return import.meta.env.VITE_APP_HOMEPAGE_URL;
  }

  public get isNonProduction(): boolean {
    return import.meta.env.DEV;
  }
}
