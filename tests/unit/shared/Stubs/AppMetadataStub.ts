import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';

export class AppMetadataStub implements IAppMetadata {
  public version = '0.12.2';

  public name = 'stub-name';

  public slogan = 'stub-slogan';

  public repositoryUrl = 'stub-repository-url';

  public homepageUrl = 'stub-homepage-url';

  public withVersion(version: string): this {
    this.version = version;
    return this;
  }

  public witName(name: string): this {
    this.name = name;
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
    this.homepageUrl = homepageUrl;
    return this;
  }
}
