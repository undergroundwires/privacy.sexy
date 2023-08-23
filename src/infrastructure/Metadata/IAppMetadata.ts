/**
 * Represents essential metadata about the application.
 *
 * Designed to decouple the process of retrieving metadata
 * (e.g., from the build environment) from the rest of the application.
 */
export interface IAppMetadata {
  readonly version: string;
  readonly name: string;
  readonly slogan: string;
  readonly repositoryUrl: string;
  readonly homepageUrl: string;
}
