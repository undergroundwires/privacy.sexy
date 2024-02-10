import { IApplication } from '@/domain/IApplication';

export function useApplication(application: IApplication) {
  return {
    application,
    projectDetails: application.projectDetails,
  };
}
