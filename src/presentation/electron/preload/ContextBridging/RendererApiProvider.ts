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
  return {
    isDesktop: true,
    log: createApiFacade(createLogger(), ['info', 'debug', 'warn', 'error']),
    os: convertToOs(process.platform),
    codeRunner: ipcConsumerCreator(IpcChannelDefinitions.CodeRunner),
  };
}

export type LoggerFactory = () => Logger;

export type ApiFacadeFactory = typeof createSecureFacade;

export type IpcConsumerProxyCreator = typeof createIpcConsumerProxy;
