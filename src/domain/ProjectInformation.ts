import { IProjectInformation } from './IProjectInformation';
import { OperatingSystem } from './OperatingSystem';

export class ProjectInformation implements IProjectInformation {
    public readonly repositoryWebUrl: string;
    constructor(
        public readonly name: string,
        public readonly version: string,
        public readonly repositoryUrl: string,
        public readonly homepage: string,
        ) {
        if (!name) {
            throw new Error('name is undefined');
        }
        if (!version || +version <= 0) {
            throw new Error('version should be higher than zero');
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
        return `${this.repositoryWebUrl}/releases/download/${this.version}/${getFileName(os, this.version)}`;
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
    switch (os) {
        case OperatingSystem.Linux:
            return `privacy.sexy-${version}.AppImage`;
        case OperatingSystem.macOS:
            return `privacy.sexy-${version}.dmg`;
        case OperatingSystem.Windows:
            return `privacy.sexy-Setup-${version}.exe`;
        default:
            throw new Error(`Unsupported os: ${OperatingSystem[os]}`);
    }
}
