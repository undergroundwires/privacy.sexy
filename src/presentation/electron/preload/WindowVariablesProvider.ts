import log from 'electron-log';
import { createNodeSystemOperations } from '@/infrastructure/SystemOperations/NodeSystemOperations';
import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { ILogger } from '@/infrastructure/Log/ILogger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { convertPlatformToOs } from './NodeOsMapper';

export function provideWindowVariables(
  createSystem = createNodeSystemOperations,
  createLogger: () => ILogger = () => createElectronLogger(log),
  convertToOs = convertPlatformToOs,
): WindowVariables {
  return {
    system: createSystem(),
    isDesktop: true,
    log: createLogger(),
    os: convertToOs(process.platform),
  };
}
