import { OperatingSystem } from '@/domain/OperatingSystem';
import { Version } from '@/domain/Version';

export interface ProjectDetails {
  readonly name: string;
  readonly version: Version;

  readonly slogan: string;
  readonly repositoryUrl: string;
  readonly homepage: string;
  readonly feedbackUrl: string;
  readonly releaseUrl: string;
  readonly repositoryWebUrl: string;
  getDownloadUrl(os: OperatingSystem): string;
}
