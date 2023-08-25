import { createNodeSystemOperations } from '@/infrastructure/Environment/SystemOperations/NodeSystemOperations';
import { WindowVariables } from '@/infrastructure/Environment/WindowVariables';
import { convertPlatformToOs } from './NodeOsMapper';

export function provideWindowVariables(
  createSystem = createNodeSystemOperations,
  convertToOs = convertPlatformToOs,
): WindowVariables {
  return {
    system: createSystem(),
    isDesktop: true,
    os: convertToOs(process.platform),
  };
}
