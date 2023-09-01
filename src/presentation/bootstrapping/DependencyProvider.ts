import { InjectionKey, provide, inject } from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { InjectionKeys } from '@/presentation/injectionSymbols';

export function provideDependencies(
  context: IApplicationContext,
  api: VueDependencyInjectionApi = { provide, inject },
) {
  const registerSingleton = <T>(key: InjectionKey<T>, value: T) => api.provide(key, value);
  const registerTransient = <T>(
    key: InjectionKey<() => T>,
    factory: () => T,
  ) => api.provide(key, factory);

  registerSingleton(InjectionKeys.useApplication, useApplication(context.app));
  registerSingleton(InjectionKeys.useRuntimeEnvironment, RuntimeEnvironment.CurrentEnvironment);
  registerTransient(InjectionKeys.useAutoUnsubscribedEvents, () => useAutoUnsubscribedEvents());
  registerTransient(InjectionKeys.useCollectionState, () => {
    const { events } = api.inject(InjectionKeys.useAutoUnsubscribedEvents)();
    return useCollectionState(context, events);
  });
}

export interface VueDependencyInjectionApi {
  provide<T>(key: InjectionKey<T>, value: T): void;
  inject<T>(key: InjectionKey<T>): T;
}
