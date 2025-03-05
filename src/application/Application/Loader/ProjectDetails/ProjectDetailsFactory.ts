import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { Version } from '@/domain/Version';

export interface ProjectDetailsParameters {
  readonly name: string,
  readonly version: Version,
  readonly slogan: string,
  readonly repositoryUrl: string,
  readonly homepage: string,
}

export type ProjectDetailsFactory = (
  args: ProjectDetailsParameters,
) => ProjectDetails;
