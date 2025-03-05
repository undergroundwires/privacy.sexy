import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ProjectDetailsLoader } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsLoader';
import { ProjectDetailsStub } from './ProjectDetailsStub';

export class ProjectDetailsLoaderStub {
  public readonly arguments = new Array<IAppMetadata | undefined>();

  private returnValue: ProjectDetails = new ProjectDetailsStub();

  public withReturnValue(value: ProjectDetails): this {
    this.returnValue = value;
    return this;
  }

  public stub(): ProjectDetailsLoader {
    return (metadata?: IAppMetadata) => {
      this.arguments.push(metadata);
      return this.returnValue;
    };
  }
}
