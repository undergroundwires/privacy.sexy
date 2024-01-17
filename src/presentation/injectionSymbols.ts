import { inject, type InjectionKey } from 'vue';
import type { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import type { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';
import type { useRuntimeEnvironment } from '@/presentation/components/Shared/Hooks/UseRuntimeEnvironment';
import type { useClipboard } from '@/presentation/components/Shared/Hooks/Clipboard/UseClipboard';
import type { useCurrentCode } from '@/presentation/components/Shared/Hooks/UseCurrentCode';
import type { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import type { useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import type { useLogger } from '@/presentation/components/Shared/Hooks/Log/UseLogger';
import type { useCodeRunner } from './components/Shared/Hooks/UseCodeRunner';
import type { useDialog } from './components/Shared/Hooks/Dialog/UseDialog';
import type { useScriptDiagnosticsCollector } from './components/Shared/Hooks/UseScriptDiagnosticsCollector';

export const InjectionKeys = {
  useCollectionState: defineTransientKey<ReturnType<typeof useCollectionState>>('useCollectionState'),
  useApplication: defineSingletonKey<ReturnType<typeof useApplication>>('useApplication'),
  useRuntimeEnvironment: defineSingletonKey<ReturnType<typeof useRuntimeEnvironment>>('useRuntimeEnvironment'),
  useAutoUnsubscribedEvents: defineTransientKey<ReturnType<typeof useAutoUnsubscribedEvents>>('useAutoUnsubscribedEvents'),
  useClipboard: defineTransientKey<ReturnType<typeof useClipboard>>('useClipboard'),
  useCurrentCode: defineTransientKey<ReturnType<typeof useCurrentCode>>('useCurrentCode'),
  useUserSelectionState: defineTransientKey<ReturnType<typeof useUserSelectionState>>('useUserSelectionState'),
  useLogger: defineTransientKey<ReturnType<typeof useLogger>>('useLogger'),
  useCodeRunner: defineTransientKey<ReturnType<typeof useCodeRunner>>('useCodeRunner'),
  useDialog: defineTransientKey<ReturnType<typeof useDialog>>('useDialog'),
  useScriptDiagnosticsCollector: defineTransientKey<ReturnType<typeof useScriptDiagnosticsCollector>>('useScriptDiagnostics'),
};

export interface InjectionKeyWithLifetime<T> {
  readonly lifetime: InjectionKeyLifetime;
  readonly key: InjectionKey<T> & symbol;
}

export interface SingletonKey<T> extends InjectionKeyWithLifetime<T> {
  readonly lifetime: InjectionKeyLifetime.Singleton;
  readonly key: InjectionKey<T> & symbol;
}

export interface TransientKey<T> extends InjectionKeyWithLifetime<() => T> {
  readonly lifetime: InjectionKeyLifetime.Transient;
  readonly key: InjectionKey<() => T> & symbol;
}

export type AnyLifetimeInjectionKey<T> = InjectionKeyWithLifetime<T> | TransientKey<T>;

export type InjectionKeySelector<T> = (keys: typeof InjectionKeys) => AnyLifetimeInjectionKey<T>;

export function injectKey<T>(
  keySelector: InjectionKeySelector<T>,
  vueInjector = inject,
): T {
  const key = keySelector(InjectionKeys);
  const injectedValue = injectRequired(key.key, vueInjector);
  if (key.lifetime === InjectionKeyLifetime.Transient) {
    const factory = injectedValue as () => T;
    const value = factory();
    return value;
  }

  return injectedValue as T;
}

export enum InjectionKeyLifetime {
  Singleton,
  Transient,
}

function defineSingletonKey<T>(key: string): SingletonKey<T> {
  return {
    lifetime: InjectionKeyLifetime.Singleton,
    key: Symbol(key),
  };
}

function defineTransientKey<T>(key: string): TransientKey<T> {
  return {
    lifetime: InjectionKeyLifetime.Transient,
    key: Symbol(key),
  };
}

function injectRequired<T>(
  key: InjectionKey<T>,
  vueInjector = inject,
): T {
  const injectedValue = vueInjector(key);

  if (injectedValue === undefined) {
    throw new Error(`Failed to inject value for key: ${key.description}`);
  }

  return injectedValue;
}
