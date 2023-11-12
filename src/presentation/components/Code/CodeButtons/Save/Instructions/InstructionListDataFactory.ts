import { OperatingSystem } from '@/domain/OperatingSystem';
import { InstructionsBuilder } from './Data/InstructionsBuilder';
import { MacOsInstructionsBuilder } from './Data/MacOsInstructionsBuilder';
import { IInstructionListData } from './InstructionListData';
import { LinuxInstructionsBuilder } from './Data/LinuxInstructionsBuilder';

const builders = new Map<OperatingSystem, InstructionsBuilder>([
  [OperatingSystem.macOS, new MacOsInstructionsBuilder()],
  [OperatingSystem.Linux, new LinuxInstructionsBuilder()],
]);

export function getInstructions(
  os: OperatingSystem,
  fileName: string,
): IInstructionListData | undefined {
  return builders
    .get(os)
    ?.build({ fileName });
}
