import { describe } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { MacOsInstructionsBuilder } from '@/presentation/components/Code/CodeButtons/Save/Instructions/Data/MacOsInstructionsBuilder';
import { runOsSpecificInstructionBuilderTests } from './OsSpecificInstructionBuilderTestRunner';

describe('MacOsInstructionsBuilder', () => {
  runOsSpecificInstructionBuilderTests({
    factory: () => new MacOsInstructionsBuilder(),
    os: OperatingSystem.macOS,
  });
});
