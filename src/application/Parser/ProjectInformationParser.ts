import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { Version } from '@/domain/Version';

export function parseProjectInformation(
  metadata: IAppMetadata,
): IProjectInformation {
  const version = new Version(
    metadata.version,
  );
  return new ProjectInformation(
    metadata.name,
    version,
    metadata.slogan,
    metadata.repositoryUrl,
    metadata.homepageUrl,
  );
}
