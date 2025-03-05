import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { Version } from '@/domain/Version';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { createGitHubProjectDetails } from './GitHubProjectDetailsFactory';
import type { ProjectDetailsFactory } from './ProjectDetailsFactory';
import type { ProjectDetailsLoader } from './ProjectDetailsLoader';

export const loadProjectDetailsFromMetadata: MetadataProjectDetailsLoader = (
  metadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance,
  createProjectDetails: ProjectDetailsFactory = createGitHubProjectDetails,
) => {
  return createProjectDetails({
    name: metadata.name,
    version: new Version(
      metadata.version,
    ),
    slogan: metadata.slogan,
    repositoryUrl: metadata.repositoryUrl,
    homepage: metadata.homepageUrl,
  });
};

export type MetadataProjectDetailsLoader = ProjectDetailsLoader & ((
  metadata?: IAppMetadata,
  createProjectDetails?: ProjectDetailsFactory,
) => ProjectDetails);
