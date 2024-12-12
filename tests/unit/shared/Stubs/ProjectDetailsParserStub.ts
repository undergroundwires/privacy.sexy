import { parseProjectDetails } from '@/application/Parser/Project/ProjectDetailsParser';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { ProjectDetailsStub } from './ProjectDetailsStub';

export class ProjectDetailsParserStub {
  public readonly arguments = new Array<IAppMetadata | undefined>();

  private returnValue: ProjectDetails = new ProjectDetailsStub();

  public withReturnValue(value: ProjectDetails): this {
    this.returnValue = value;
    return this;
  }

  public getStub(): typeof parseProjectDetails {
    return (metadata?: IAppMetadata) => {
      this.arguments.push(metadata);
      return this.returnValue;
    };
  }
}
