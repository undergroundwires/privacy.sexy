import { createNodeSystemOperations } from '@/infrastructure/SystemOperations/NodeSystemOperations';
import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { convertPlatformToOs } from './NodeOsMapper';

export function provideWindowVariables(
  createSystem = createNodeSystemOperations,
  createLogger: () => Logger = () => createElectronLogger(),
  convertToOs = convertPlatformToOs,
): WindowVariables {
  return {
    system: createSystem(),
    isDesktop: true,
    log: createLogger(),
    os: convertToOs(process.platform),
  };
}
