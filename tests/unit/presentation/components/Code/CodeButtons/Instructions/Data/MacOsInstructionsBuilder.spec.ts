import 'mocha';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { MacOsInstructionsBuilder } from '@/presentation/components/Code/CodeButtons/Instructions/Data/MacOsInstructionsBuilder';
import { runOsSpecificInstructionBuilderTests } from './OsSpecificInstructionBuilderTestRunner';

describe('MacOsInstructionsBuilder', () => {
  runOsSpecificInstructionBuilderTests({
    factory: () => new MacOsInstructionsBuilder(),
    os: OperatingSystem.macOS,
  });
});
