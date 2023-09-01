import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import type { useAutoUnsubscribedEvents } from './components/Shared/Hooks/UseAutoUnsubscribedEvents';
import type { InjectionKey } from 'vue';

export const InjectionKeys = {
  useCollectionState: defineTransientKey<ReturnType<typeof useCollectionState>>('useCollectionState'),
  useApplication: defineSingletonKey<ReturnType<typeof useApplication>>('useApplication'),
  useRuntimeEnvironment: defineSingletonKey<ReturnType<typeof useRuntimeEnvironment>>('useRuntimeEnvironment'),
  useAutoUnsubscribedEvents: defineTransientKey<ReturnType<typeof useAutoUnsubscribedEvents>>('useAutoUnsubscribedEvents'),
};

function defineSingletonKey<T>(key: string): InjectionKey<T> {
  return Symbol(key) as InjectionKey<T>;
}

function defineTransientKey<T>(key: string): InjectionKey<() => T> {
  return Symbol(key) as InjectionKey<() => T>;
}
