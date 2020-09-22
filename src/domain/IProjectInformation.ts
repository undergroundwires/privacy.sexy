import { OperatingSystem } from './OperatingSystem';
export interface IProjectInformation {
    readonly name: string;
    readonly version: string;
    readonly repositoryUrl: string;
    readonly homepage: string;
    readonly feedbackUrl: string;
    readonly releaseUrl: string;
    readonly repositoryWebUrl: string;
    getDownloadUrl(os: OperatingSystem): string;
}
