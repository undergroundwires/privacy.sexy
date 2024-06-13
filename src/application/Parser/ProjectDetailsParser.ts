import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { GitHubProjectDetails } from '@/domain/Project/GitHubProjectDetails';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { Version } from '@/domain/Version';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import type { ConstructorArguments } from '@/TypeHelpers';

export function
parseProjectDetails(
  metadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance,
  createProjectDetails: ProjectDetailsFactory = (
    ...args
  ) => new GitHubProjectDetails(...args),
): ProjectDetails {
  const version = new Version(
    metadata.version,
  );
  return createProjectDetails(
    metadata.name,
    version,
    metadata.slogan,
    metadata.repositoryUrl,
    metadata.homepageUrl,
  );
}

export interface ProjectDetailsParser {
  (): ProjectDetails;
}

export type ProjectDetailsFactory = (
  ...args: ConstructorArguments<typeof GitHubProjectDetails>
) => ProjectDetails;
