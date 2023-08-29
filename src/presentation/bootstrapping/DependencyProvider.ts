import { InjectionKey, provide } from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import {
  useCollectionStateKey, useApplicationKey, useRuntimeEnvironmentKey,
} from '@/presentation/injectionSymbols';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';

export function provideDependencies(context: IApplicationContext) {
  registerSingleton(useApplicationKey, useApplication(context.app));
  registerTransient(useCollectionStateKey, () => useCollectionState(context));
  registerSingleton(useRuntimeEnvironmentKey, RuntimeEnvironment.CurrentEnvironment);
}

function registerSingleton<T>(
  key: InjectionKey<T>,
  value: T,
) {
  provide(key, value);
}

function registerTransient<T>(
  key: InjectionKey<() => T>,
  factory: () => T,
) {
  provide(key, factory);
}
