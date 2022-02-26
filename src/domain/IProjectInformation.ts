import { OperatingSystem } from '@/domain/OperatingSystem';
import { Version } from '@/domain/Version';

export interface IProjectInformation {
  readonly name: string;
  readonly version: Version;
  readonly repositoryUrl: string;
  readonly homepage: string;
  readonly feedbackUrl: string;
  readonly releaseUrl: string;
  readonly repositoryWebUrl: string;
  getDownloadUrl(os: OperatingSystem): string;
}
