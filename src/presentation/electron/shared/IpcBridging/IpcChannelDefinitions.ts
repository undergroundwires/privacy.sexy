import { FunctionKeys } from '@/TypeHelpers';
import { CodeRunner } from '@/application/CodeRunner/CodeRunner';
import { Dialog } from '@/presentation/common/Dialog';
import { ScriptDiagnosticsCollector } from '@/application/ScriptDiagnostics/ScriptDiagnosticsCollector';
import { IpcChannel } from './IpcChannel';

export const IpcChannelDefinitions = {
  CodeRunner: defineElectronIpcChannel<CodeRunner>('code-run', ['runCode']),
  Dialog: defineElectronIpcChannel<Dialog>('dialogs', ['showError', 'saveFile']),
  ScriptDiagnosticsCollector: defineElectronIpcChannel<ScriptDiagnosticsCollector>('script-diagnostics-collector', ['collectDiagnosticInformation']),
} as const;

export type ChannelDefinitionKey = keyof typeof IpcChannelDefinitions;

function defineElectronIpcChannel<T>(
  name: string,
  functionNames: readonly FunctionKeys<T>[],
): IpcChannel<T> {
  return {
    namespace: name,
    accessibleMembers: functionNames,
  };
}
