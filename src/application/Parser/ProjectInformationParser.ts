import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { Version } from '@/domain/Version';

export function parseProjectInformation(
  environment: NodeJS.ProcessEnv | VueAppEnvironment,
): IProjectInformation {
  const version = new Version(environment[VueAppEnvironmentKeys.VUE_APP_VERSION]);
  return new ProjectInformation(
    environment[VueAppEnvironmentKeys.VUE_APP_NAME],
    version,
    environment[VueAppEnvironmentKeys.VUE_APP_SLOGAN],
    environment[VueAppEnvironmentKeys.VUE_APP_REPOSITORY_URL],
    environment[VueAppEnvironmentKeys.VUE_APP_HOMEPAGE_URL],
  );
}

export const VueAppEnvironmentKeys = {
  VUE_APP_VERSION: 'VUE_APP_VERSION',
  VUE_APP_NAME: 'VUE_APP_NAME',
  VUE_APP_SLOGAN: 'VUE_APP_SLOGAN',
  VUE_APP_REPOSITORY_URL: 'VUE_APP_REPOSITORY_URL',
  VUE_APP_HOMEPAGE_URL: 'VUE_APP_HOMEPAGE_URL',
} as const;

export type VueAppEnvironment = {
  [K in keyof typeof VueAppEnvironmentKeys]: string;
};
