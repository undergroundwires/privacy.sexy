import type { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import type { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import type { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import type { useClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/UseClipboard';
import type { useCurrentCode } from '@/presentation/components/Shared/Hooks/UseCurrentCode';
import type { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import type { InjectionKey } from 'vue';

export const InjectionKeys = {
  useCollectionState: defineTransientKey<ReturnType<typeof useCollectionState>>('useCollectionState'),
  useApplication: defineSingletonKey<ReturnType<typeof useApplication>>('useApplication'),
  useRuntimeEnvironment: defineSingletonKey<ReturnType<typeof useRuntimeEnvironment>>('useRuntimeEnvironment'),
  useAutoUnsubscribedEvents: defineTransientKey<ReturnType<typeof useAutoUnsubscribedEvents>>('useAutoUnsubscribedEvents'),
  useClipboard: defineTransientKey<ReturnType<typeof useClipboard>>('useClipboard'),
  useCurrentCode: defineTransientKey<ReturnType<typeof useCurrentCode>>('useCurrentCode'),
};

function defineSingletonKey<T>(key: string): InjectionKey<T> {
  return Symbol(key) as InjectionKey<T>;
}

function defineTransientKey<T>(key: string): InjectionKey<() => T> {
  return Symbol(key) as InjectionKey<() => T>;
}
