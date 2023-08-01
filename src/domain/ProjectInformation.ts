import { assertInRange } from '@/application/Common/Enum';
import { IProjectInformation } from './IProjectInformation';
import { OperatingSystem } from './OperatingSystem';
import { Version } from './Version';

export class ProjectInformation implements IProjectInformation {
  public readonly repositoryWebUrl: string;

  constructor(
    public readonly name: string,
    public readonly version: Version,
    public readonly slogan: string,
    public readonly repositoryUrl: string,
    public readonly homepage: string,
  ) {
    if (!name) {
      throw new Error('name is undefined');
    }
    if (!version) {
      throw new Error('undefined version');
    }
    if (!slogan) {
      throw new Error('undefined slogan');
    }
    if (!repositoryUrl) {
      throw new Error('repositoryUrl is undefined');
    }
    if (!homepage) {
      throw new Error('homepage is undefined');
    }
    this.repositoryWebUrl = getWebUrl(this.repositoryUrl);
  }

  public getDownloadUrl(os: OperatingSystem): string {
    const fileName = getFileName(os, this.version.toString());
    return `${this.repositoryWebUrl}/releases/download/${this.version}/${fileName}`;
  }

  public get feedbackUrl(): string {
    return `${this.repositoryWebUrl}/issues`;
  }

  public get releaseUrl(): string {
    return `${this.repositoryWebUrl}/releases/tag/${this.version}`;
  }
}

function getWebUrl(gitUrl: string) {
  if (gitUrl.endsWith('.git')) {
    return gitUrl.substring(0, gitUrl.length - 4);
  }
  return gitUrl;
}

function getFileName(os: OperatingSystem, version: string): string {
  assertInRange(os, OperatingSystem);
  switch (os) {
    case OperatingSystem.Linux:
      return `privacy.sexy-${version}.AppImage`;
    case OperatingSystem.macOS:
      return `privacy.sexy-${version}.dmg`;
    case OperatingSystem.Windows:
      return `privacy.sexy-Setup-${version}.exe`;
    default:
      throw new RangeError(`Unsupported os: ${OperatingSystem[os]}`);
  }
}
