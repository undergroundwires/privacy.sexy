import { IApplication } from '@/domain/IApplication';

export function useApplication(application: IApplication) {
  if (!application) {
    throw new Error('missing application');
  }
  return {
    application,
    info: application.info,
  };
}
