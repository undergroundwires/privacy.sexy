import { IProjectInformation } from '@/domain/IProjectInformation';
import { Version } from '@/domain/Version';
import { VersionStub } from './VersionStub';

export class ProjectInformationStub implements IProjectInformation {
  public name = 'stub-name';

  public version = new VersionStub();

  public repositoryUrl = 'stub-repositoryUrl';

  public homepage = 'stub-homepage';

  public feedbackUrl = 'stub-feedbackUrl';

  public releaseUrl = 'stub-releaseUrl';

  public repositoryWebUrl = 'stub-repositoryWebUrl';

  public downloadUrl = 'stub-downloadUrl';

  public slogan = 'stub-slogan';

  public withName(name: string): ProjectInformationStub {
    this.name = name;
    return this;
  }

  public withVersion(version: Version): ProjectInformationStub {
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

  public getDownloadUrl(): string {
    return this.downloadUrl;
  }
}
