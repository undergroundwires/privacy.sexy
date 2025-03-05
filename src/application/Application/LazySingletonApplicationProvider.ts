import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import type { Application } from '@/domain/Application/Application';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import type { ApplicationLoader } from '@/application/Application/Loader/ApplicationLoader';
import type { ApplicationProvider } from '@/application/Application/ApplicationProvider';

let applicationGetter: AsyncLazy<Application> | undefined;

type LazySingletonApplicationProvider = ApplicationProvider & ((
  loader: ApplicationLoader,
) => ReturnType<ApplicationProvider>);

export const createOrGetApplication: LazySingletonApplicationProvider = (
  loader: ApplicationLoader = loadApplicationComposite,
) => {
  if (!applicationGetter) {
    applicationGetter = new AsyncLazy<Application>(() => Promise.resolve(loader()));
  }
  return applicationGetter.getValue();
};

export function invalidateApplication() {
  applicationGetter = undefined;
}
