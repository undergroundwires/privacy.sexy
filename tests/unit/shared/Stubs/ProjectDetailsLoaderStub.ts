import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ProjectDetailsLoader } from '@/application/Loader/ProjectDetails/ProjectDetailsLoader';
import { ProjectDetailsStub } from './ProjectDetailsStub';

export class ProjectDetailsLoaderStub {
  private returnValue: ProjectDetails = new ProjectDetailsStub();

  public withReturnValue(value: ProjectDetails): this {
    this.returnValue = value;
    return this;
  }

  public getStub(): ProjectDetailsLoader {
    return () => {
      return this.returnValue;
    };
  }
}
