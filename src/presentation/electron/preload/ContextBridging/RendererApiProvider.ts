import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { convertPlatformToOs } from '@/infrastructure/RuntimeEnvironment/Node/NodeOsMapper';
import { createIpcConsumerProxy } from '../../shared/IpcBridging/IpcProxy';
import { IpcChannelDefinitions } from '../../shared/IpcBridging/IpcChannelDefinitions';
import { createSecureFacade } from './SecureFacadeCreator';

export function provideWindowVariables(
  createLogger: LoggerFactory = () => createElectronLogger(),
  convertToOs = convertPlatformToOs,
  createApiFacade: ApiFacadeFactory = createSecureFacade,
  ipcConsumerCreator: IpcConsumerProxyCreator = createIpcConsumerProxy,
): WindowVariables {
  // Enforces mandatory variable availability at compile time
  const variables: RequiredWindowVariables = {
    isRunningAsDesktopApplication: true,
    log: createApiFacade(createLogger(), ['info', 'debug', 'warn', 'error']),
    os: convertToOs(process.platform),
    codeRunner: ipcConsumerCreator(IpcChannelDefinitions.CodeRunner),
    dialog: ipcConsumerCreator(IpcChannelDefinitions.Dialog),
  };
  return variables;
}

type RequiredWindowVariables = PartiallyRequired<WindowVariables, 'os' /* | 'anotherOptionalKey'.. */>;
type PartiallyRequired<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export type LoggerFactory = () => Logger;

export type ApiFacadeFactory = typeof createSecureFacade;

export type IpcConsumerProxyCreator = typeof createIpcConsumerProxy;
