import { FunctionKeys } from '@/TypeHelpers';
import { CodeRunner } from '@/application/CodeRunner';
import { IpcChannel } from './IpcChannel';

export const IpcChannelDefinitions = {
  CodeRunner: defineElectronIpcChannel<CodeRunner>('code-run', ['runCode']),
} as const;

function defineElectronIpcChannel<T>(
  name: string,
  functionNames: readonly FunctionKeys<T>[],
): IpcChannel<T> {
  return {
    namespace: name,
    accessibleMembers: functionNames,
  };
}
