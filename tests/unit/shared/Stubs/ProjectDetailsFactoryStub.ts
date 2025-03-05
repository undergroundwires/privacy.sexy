import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { ProjectDetailsFactory } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsFactory';

export function createProjectDetailsFactoryStub(): ProjectDetailsFactory {
  return (params) => {
    const details = new ProjectDetailsStub()
      .withName(params.name)
      .withVersion(params.version)
      .withSlogan(params.slogan)
      .withRepositoryUrl(params.repositoryUrl)
      .withHomepageUrl(params.homepage);
    return details;
  };
}
