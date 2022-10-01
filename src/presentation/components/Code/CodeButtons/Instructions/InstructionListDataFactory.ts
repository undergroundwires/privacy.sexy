import { OperatingSystem } from '@/domain/OperatingSystem';
import { InstructionsBuilder } from './Data/InstructionsBuilder';
import { MacOsInstructionsBuilder } from './Data/MacOsInstructionsBuilder';
import { IInstructionListData } from './InstructionListData';

const builders = new Map<OperatingSystem, InstructionsBuilder>([
  [OperatingSystem.macOS, new MacOsInstructionsBuilder()],
]);

export function hasInstructions(os: OperatingSystem) {
  return builders.has(os);
}

export function getInstructions(
  os: OperatingSystem,
  fileName: string,
): IInstructionListData {
  return builders
    .get(os)
    .build({ fileName });
}
