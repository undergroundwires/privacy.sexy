import type { Version } from '@/domain/Version';
import type { ProjectDetailsParameters } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsFactory';
import { VersionStub } from './VersionStub';

export class ProjectDetailsParametersStub
implements ProjectDetailsParameters {
  public name = `[${ProjectDetailsParametersStub.name}]name`;

  public version: Version = new VersionStub();

  public repositoryUrl = `[${ProjectDetailsParametersStub.name}]repository-url`;

  public homepage = `[${ProjectDetailsParametersStub.name}]homepage`;

  public slogan = `[${ProjectDetailsParametersStub.name}]slogan`;

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withVersion(version: VersionStub): this {
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

  public withHomepage(homepage: string): this {
    this.homepage = homepage;
    return this;
  }
}
