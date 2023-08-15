import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { useEnvironment } from '@/presentation/components/Shared/Hooks/UseEnvironment';
import type { InjectionKey } from 'vue';

export const useCollectionStateKey = defineTransientKey<ReturnType<typeof useCollectionState>>('useCollectionState');
export const useApplicationKey = defineSingletonKey<ReturnType<typeof useApplication>>('useApplication');
export const useEnvironmentKey = defineSingletonKey<ReturnType<typeof useEnvironment>>('useEnvironment');

function defineSingletonKey<T>(key: string) {
  return Symbol(key) as InjectionKey<T>;
}

function defineTransientKey<T>(key: string) {
  return Symbol(key) as InjectionKey<() => T>;
}
