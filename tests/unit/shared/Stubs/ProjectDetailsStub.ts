import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { Version } from '@/domain/Version';
import { VersionStub } from './VersionStub';

export class ProjectDetailsStub implements ProjectDetails {
  public name = 'stub-name';

  public version = new VersionStub();

  public repositoryUrl = 'stub-repositoryUrl';

  public homepage = 'stub-homepage';

  public feedbackUrl = 'stub-feedbackUrl';

  public releaseUrl = 'stub-releaseUrl';

  public repositoryWebUrl = 'stub-repositoryWebUrl';

  public downloadUrl = 'stub-downloadUrl';

  public slogan = 'stub-slogan';

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withVersion(version: Version): this {
    this.version = version;
    return this;
  }

  public withSlogan(slogan: string): this {
    this.slogan = slogan;
    return this;
  }

  public withRepositoryUrl(repositoryUrl: string): this {
    this.repositoryUrl = repositoryUrl;
    return this;
  }

  public withHomepageUrl(homepageUrl: string): this {
    this.homepage = homepageUrl;
    return this;
  }

  public withFeedbackUrl(feedbackUrl: string): this {
    this.feedbackUrl = feedbackUrl;
    return this;
  }

  public withReleaseUrl(releaseUrl: string): this {
    this.releaseUrl = releaseUrl;
    return this;
  }

  public withRepositoryWebUrl(repositoryWebUrl: string): this {
    this.repositoryWebUrl = repositoryWebUrl;
    return this;
  }

  public getDownloadUrl(): string {
    return this.downloadUrl;
  }
}
