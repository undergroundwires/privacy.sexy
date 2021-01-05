import { IProjectInformation } from '@/domain/IProjectInformation';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class ProjectInformationStub implements IProjectInformation {
    public name = 'name';
    public version = 'version';
    public repositoryUrl = 'repositoryUrl';
    public homepage = 'homepage';
    public feedbackUrl = 'feedbackUrl';
    public releaseUrl = 'releaseUrl';
    public repositoryWebUrl = 'repositoryWebUrl';
    public withName(name: string): ProjectInformationStub {
        this.name = name;
        return this;
    }
    public withVersion(version: string): ProjectInformationStub {
        this.version = version;
        return this;
    }
    public withRepositoryUrl(repositoryUrl: string): ProjectInformationStub {
        this.repositoryUrl = repositoryUrl;
        return this;
    }
    public withHomepageUrl(homepageUrl: string): ProjectInformationStub {
        this.homepage = homepageUrl;
        return this;
    }
    public withFeedbackUrl(feedbackUrl: string): ProjectInformationStub {
        this.feedbackUrl = feedbackUrl;
        return this;
    }
    public withReleaseUrl(releaseUrl: string): ProjectInformationStub {
        this.releaseUrl = releaseUrl;
        return this;
    }
    public withRepositoryWebUrl(repositoryWebUrl: string): ProjectInformationStub {
        this.repositoryWebUrl = repositoryWebUrl;
        return this;
    }
    public getDownloadUrl(os: OperatingSystem): string {
        throw new Error('Method not implemented.');
    }
}
