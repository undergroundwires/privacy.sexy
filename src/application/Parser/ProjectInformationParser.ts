import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { Version } from '@/domain/Version';

export function parseProjectInformation(
  environment: NodeJS.ProcessEnv,
): IProjectInformation {
  const version = new Version(environment.VUE_APP_VERSION);
  return new ProjectInformation(
    environment.VUE_APP_NAME,
    version,
    environment.VUE_APP_REPOSITORY_URL,
    environment.VUE_APP_HOMEPAGE_URL,
  );
}
