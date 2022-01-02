import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';

export function parseProjectInformation(
  environment: NodeJS.ProcessEnv,
): IProjectInformation {
  return new ProjectInformation(
    environment.VUE_APP_NAME,
    environment.VUE_APP_VERSION,
    environment.VUE_APP_REPOSITORY_URL,
    environment.VUE_APP_HOMEPAGE_URL,
  );
}
