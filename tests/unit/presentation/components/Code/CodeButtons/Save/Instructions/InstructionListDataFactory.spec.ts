import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getInstructions } from '@/presentation/components/Code/CodeButtons/Save/Instructions/InstructionListDataFactory';
import { getEnumValues } from '@/application/Common/Enum';
import { InstructionsBuilder } from '@/presentation/components/Code/CodeButtons/Save/Instructions/Data/InstructionsBuilder';

describe('InstructionListDataFactory', () => {
  const supportedOsList = [OperatingSystem.macOS, OperatingSystem.Linux];
  describe('getInstructions', () => {
    it('returns expected if os is supported', () => {
      // arrange
      const fileName = 'test.file';
      // act
      const actualResults = supportedOsList.map((os) => getInstructions(os, fileName));
      // assert
      expect(actualResults.every((result) => result instanceof InstructionsBuilder));
    });
    it('return undefined if OS is not supported', () => {
      // arrange
      const expected = undefined;
      const fileName = 'test.file';
      const unsupportedOses = getEnumValues(OperatingSystem)
        .filter((value) => !supportedOsList.includes(value));
      // act
      const actualResults = unsupportedOses.map((os) => getInstructions(os, fileName));
      // assert
      expect(actualResults.every((result) => result === expected));
    });
  });
});
