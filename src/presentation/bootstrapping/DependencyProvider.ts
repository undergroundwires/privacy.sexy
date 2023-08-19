import { InjectionKey, provide } from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import {
  useCollectionStateKey, useApplicationKey, useEnvironmentKey,
} from '@/presentation/injectionSymbols';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { Environment } from '@/application/Environment/Environment';

export function provideDependencies(context: IApplicationContext) {
  registerSingleton(useApplicationKey, useApplication(context.app));
  registerTransient(useCollectionStateKey, () => useCollectionState(context));
  registerSingleton(useEnvironmentKey, Environment.CurrentEnvironment);
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
