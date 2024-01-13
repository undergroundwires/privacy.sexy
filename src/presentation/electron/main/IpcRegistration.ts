import { ScriptFileCodeRunner } from '@/infrastructure/CodeRunner/ScriptFileCodeRunner';
import { CodeRunner } from '@/application/CodeRunner/CodeRunner';
import { Dialog } from '@/presentation/common/Dialog';
import { ElectronDialog } from '@/infrastructure/Dialog/Electron/ElectronDialog';
import { IpcChannel } from '@/presentation/electron/shared/IpcBridging/IpcChannel';
import { registerIpcChannel } from '../shared/IpcBridging/IpcProxy';
import { ChannelDefinitionKey, IpcChannelDefinitions } from '../shared/IpcBridging/IpcChannelDefinitions';

export function registerAllIpcChannels(
  createCodeRunner: CodeRunnerFactory = () => new ScriptFileCodeRunner(),
  createDialog: DialogFactory = () => new ElectronDialog(),
  registrar: IpcChannelRegistrar = registerIpcChannel,
) {
  const ipcInstanceCreators: IpcChannelRegistrars = {
    CodeRunner: () => createCodeRunner(),
    Dialog: () => createDialog(),
  };
  Object.entries(ipcInstanceCreators).forEach(([name, instanceFactory]) => {
    try {
      const definition = IpcChannelDefinitions[name];
      const instance = instanceFactory();
      registrar(definition, instance);
    } catch (err) {
      throw new AggregateError([err], `main: Failed to register IPC channel "${name}":\n${err.message}`);
    }
  });
}

export type CodeRunnerFactory = () => CodeRunner;
export type DialogFactory = () => Dialog;
export type IpcChannelRegistrar = typeof registerIpcChannel;

type RegistrationChannel<T extends ChannelDefinitionKey> = (typeof IpcChannelDefinitions)[T];
type ExtractChannelServiceType<T> = T extends IpcChannel<infer U> ? U : never;
type IpcChannelRegistrars = {
  [K in ChannelDefinitionKey]: () => ExtractChannelServiceType<RegistrationChannel<K>>;
};
