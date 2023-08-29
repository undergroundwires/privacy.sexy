import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import type { InjectionKey } from 'vue';

export const useCollectionStateKey = defineTransientKey<ReturnType<typeof useCollectionState>>('useCollectionState');
export const useApplicationKey = defineSingletonKey<ReturnType<typeof useApplication>>('useApplication');
export const useRuntimeEnvironmentKey = defineSingletonKey<ReturnType<typeof useRuntimeEnvironment>>('useRuntimeEnvironment');

function defineSingletonKey<T>(key: string) {
  return Symbol(key) as InjectionKey<T>;
}

function defineTransientKey<T>(key: string) {
  return Symbol(key) as InjectionKey<() => T>;
}
