import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { Version } from '@/domain/Version';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { ConstructorArguments } from '@/TypeHelpers';

export function
parseProjectInformation(
  metadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance,
  createProjectInformation: ProjectInformationFactory = (
    ...args
  ) => new ProjectInformation(...args),
): IProjectInformation {
  const version = new Version(
    metadata.version,
  );
  return createProjectInformation(
    metadata.name,
    version,
    metadata.slogan,
    metadata.repositoryUrl,
    metadata.homepageUrl,
  );
}

export type ProjectInformationFactory = (
  ...args: ConstructorArguments<typeof ProjectInformation>
) => IProjectInformation;
