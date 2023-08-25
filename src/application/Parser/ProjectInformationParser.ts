import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { Version } from '@/domain/Version';
import { AppMetadataFactory } from '@/infrastructure/Metadata/AppMetadataFactory';
import { ConstructorArguments } from '@/TypeHelpers';

export function
parseProjectInformation(
  metadata: IAppMetadata = AppMetadataFactory.Current.instance,
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
