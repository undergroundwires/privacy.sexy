import type { Application } from '@/domain/Application/Application';

export function useApplication(application: Application) {
  return {
    application,
    projectDetails: application.projectDetails,
  };
}
