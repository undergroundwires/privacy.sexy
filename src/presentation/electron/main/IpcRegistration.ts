import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { CodeRunner } from '@/application/CodeRunner';
import { registerIpcChannel } from '../shared/IpcBridging/IpcProxy';
import { IpcChannelDefinitions } from '../shared/IpcBridging/IpcChannelDefinitions';

export function registerAllIpcChannels(
  createCodeRunner: CodeRunnerFactory = () => new ScriptFileCodeRunner(),
  registrar: IpcRegistrar = registerIpcChannel,
) {
  const registrars: Record<keyof typeof IpcChannelDefinitions, () => void> = {
    CodeRunner: () => registrar(IpcChannelDefinitions.CodeRunner, createCodeRunner()),
  };
  Object.entries(registrars).forEach(([name, register]) => {
    try {
      register();
    } catch (err) {
      throw new AggregateError(`main: Failed to register IPC channel "${name}"`, err);
    }
  });
}

export type CodeRunnerFactory = () => CodeRunner;

export type IpcRegistrar = typeof registerIpcChannel;
