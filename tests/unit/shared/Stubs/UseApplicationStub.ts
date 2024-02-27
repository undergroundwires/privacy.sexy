import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import type { IApplication } from '@/domain/IApplication';
import { ApplicationStub } from './ApplicationStub';

export class UseApplicationStub {
  private application: IApplication = new ApplicationStub();

  public withState(application: IApplication) {
    this.application = application;
    return this;
  }

  public get(): ReturnType<typeof useApplication> {
    return {
      application: this.application,
      projectDetails: this.application.projectDetails,
    };
  }
}
