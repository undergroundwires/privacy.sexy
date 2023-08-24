import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformationStub } from './ProjectInformationStub';

export class ProjectInformationParserStub {
  public readonly arguments = new Array<IAppMetadata>();

  private returnValue: IProjectInformation = new ProjectInformationStub();

  public withReturnValue(value: IProjectInformation): this {
    this.returnValue = value;
    return this;
  }

  public getStub(): typeof parseProjectInformation {
    return (metadata) => {
      this.arguments.push(metadata);
      return this.returnValue;
    };
  }
}
