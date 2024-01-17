import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { convertPlatformToOs } from '@/infrastructure/RuntimeEnvironment/Node/NodeOsMapper';
import { createIpcConsumerProxy } from '../../shared/IpcBridging/IpcProxy';
import { IpcChannelDefinitions } from '../../shared/IpcBridging/IpcChannelDefinitions';
import { createSecureFacade } from './SecureFacadeCreator';

export function provideWindowVariables(
  createApiFacade: ApiFacadeFactory = createSecureFacade,
  ipcConsumerCreator: IpcConsumerProxyCreator = createIpcConsumerProxy,
  convertToOs = convertPlatformToOs,
  createLogger: LoggerFactory = () => createElectronLogger(),
): WindowVariables {
  // Enforces mandatory variable availability at compile time
  const variables: RequiredWindowVariables = {
    isRunningAsDesktopApplication: true,
    log: createApiFacade(createLogger(), ['info', 'debug', 'warn', 'error']),
    os: convertToOs(process.platform),
    codeRunner: ipcConsumerCreator(IpcChannelDefinitions.CodeRunner),
    dialog: ipcConsumerCreator(IpcChannelDefinitions.Dialog),
    scriptDiagnosticsCollector: ipcConsumerCreator(
      IpcChannelDefinitions.ScriptDiagnosticsCollector,
    ),
  };
  return variables;
}

type RequiredWindowVariables = PartiallyRequired<WindowVariables, 'os' /* | 'anotherOptionalKey'.. */>;
type PartiallyRequired<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export type ApiFacadeFactory = typeof createSecureFacade;

export type IpcConsumerProxyCreator = typeof createIpcConsumerProxy;

export type LoggerFactory = () => Logger;
