import { describe, it, expect } from 'vitest';
import { AllSupportedOperatingSystems, SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { generateOsTimestampedFileName } from '@/infrastructure/CodeRunner/FileNameGenerator';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('FileNameGenerator', () => {
  describe('generateOsTimestampedFileName', () => {
    it('generates correct prefix', () => {
      // arrange
      const expectedPrefix = 'run';
      // act
      const fileName = generateFileNamePartsForTesting();
      // assert
      expect(fileName.prefix).to.equal(expectedPrefix);
    });
    it('generates correct timestamp', () => {
      // arrange
      const currentDate = '2023-01-01T12:00:00.000Z';
      const expectedTimestamp = '2023-01-01_12-00-00';
      const date = new Date(currentDate);
      // act
      const fileName = generateFileNamePartsForTesting({ date });
      // assert
      expect(fileName.timestamp).to.equal(expectedTimestamp, formatAssertionMessage[
        `Generated file name: ${fileName.generatedFileName}`
      ]);
    });
    describe('generates correct extension', () => {
      const testScenarios: Record<SupportedOperatingSystem, string> = {
        [OperatingSystem.Windows]: 'bat',
        [OperatingSystem.Linux]: 'sh',
        [OperatingSystem.macOS]: 'sh',
      };
      AllSupportedOperatingSystems.forEach((operatingSystem) => {
        it(`on ${OperatingSystem[operatingSystem]}`, () => {
          // arrange
          const expectedExtension = testScenarios[operatingSystem];
          // act
          const fileName = generateFileNamePartsForTesting({ operatingSystem });
          // assert
          expect(fileName.extension).to.equal(expectedExtension, formatAssertionMessage[
            `Generated file name: ${fileName.generatedFileName}`
          ]);
        });
      });
    });
    it('generates filename without extension for unknown OS', () => {
      // arrange
      const unknownOs = 'Unknown' as unknown as OperatingSystem;
      // act
      const fileName = generateFileNamePartsForTesting({ operatingSystem: unknownOs });
      // assert
      expect(fileName.extension).toBeUndefined();
    });
  });
});

interface TestFileNameComponents {
  readonly prefix: string;
  readonly timestamp: string;
  readonly extension?: string;
  readonly generatedFileName: string;
}

function generateFileNamePartsForTesting(testScenario?: {
  operatingSystem?: OperatingSystem,
  date?: Date,
}): TestFileNameComponents {
  const operatingSystem = testScenario?.operatingSystem ?? OperatingSystem.Windows;
  const date = testScenario?.date ?? new Date();
  const fileName = generateOsTimestampedFileName(operatingSystem, date);
  const pattern = /^(?<prefix>[^-]+)-(?<timestamp>[^.]+)(?:\.(?<extension>[^.]+))?$/; // prefix-timestamp.extension
  const match = fileName.match(pattern);
  if (!match?.groups?.prefix || !match?.groups?.timestamp) {
    throw new Error(`Failed to parse prefix or timestamp: ${fileName}`);
  }
  return {
    generatedFileName: fileName,
    prefix: match.groups.prefix,
    timestamp: match.groups.timestamp,
    extension: match.groups.extension,
  };
}
