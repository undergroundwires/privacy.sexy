import type { FunctionKeys } from '@/TypeHelpers';

export interface IpcChannel<T> {
  readonly namespace: string;
  readonly accessibleMembers: readonly FunctionKeys<T>[]; // Property keys are not yet supported
}
