import type { Application } from '@/domain/Application';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { loadApplication, type ApplicationLoader } from './ApplicationLoader';
import type { ApplicationProvider } from './ApplicationProvider';

let ApplicationGetter: AsyncLazy<Application> | undefined;

type LazySingletonApplicationProvider = ApplicationProvider & ((
  loader: ApplicationLoader,
) => ReturnType<ApplicationProvider>);

export const createOrGetApplication: LazySingletonApplicationProvider = (
  loader: ApplicationLoader = loadApplication,
) => {
  if (!ApplicationGetter) {
    ApplicationGetter = new AsyncLazy<Application>(() => Promise.resolve(loader()));
  }
  return ApplicationGetter.getValue();
};
