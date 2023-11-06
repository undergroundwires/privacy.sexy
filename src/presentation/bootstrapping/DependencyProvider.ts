import { InjectionKey, provide, inject } from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { useClipboard } from '../components/Shared/Hooks/Clipboard/UseClipboard';
import { useCurrentCode } from '../components/Shared/Hooks/UseCurrentCode';

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
  registerTransient(InjectionKeys.useClipboard, () => useClipboard());
  registerTransient(InjectionKeys.useCurrentCode, () => {
    const { events } = api.inject(InjectionKeys.useAutoUnsubscribedEvents)();
    const state = api.inject(InjectionKeys.useCollectionState)();
    return useCurrentCode(state, events);
  });
}

export interface VueDependencyInjectionApi {
  provide<T>(key: InjectionKey<T>, value: T): void;
  inject<T>(key: InjectionKey<T>): T;
}
