import { describe, it, expect } from 'vitest';
import { AllSupportedOperatingSystems, SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { OsTimestampedFilenameGenerator } from '@/infrastructure/CodeRunner/Creation/Filename/OsTimestampedFilenameGenerator';

describe('OsTimestampedFilenameGenerator', () => {
  describe('generateFilename', () => {
    it('generates correct prefix', () => {
      // arrange
      const expectedPrefix = 'run';
      // act
      const filename = generateFilenamePartsForTesting();
      // assert
      expect(filename.prefix).to.equal(expectedPrefix);
    });
    it('generates correct timestamp', () => {
      // arrange
      const currentDate = '2023-01-01T12:00:00.000Z';
      const expectedTimestamp = '2023-01-01_12-00-00';
      const date = new Date(currentDate);
      // act
      const filename = generateFilenamePartsForTesting({ date });
      // assert
      expect(filename.timestamp).to.equal(expectedTimestamp, formatAssertionMessage[
        `Generated file name: ${filename.generatedFileName}`
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
          const filename = generateFilenamePartsForTesting({ operatingSystem });
          // assert
          expect(filename.extension).to.equal(expectedExtension, formatAssertionMessage[
            `Generated file name: ${filename.generatedFileName}`
          ]);
        });
      });
    });
    describe('generates filename without extension for unknown OS', () => {
      // arrange
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly unknownOs?: OperatingSystem;
      }> = [
        {
          description: 'unsupported OS',
          unknownOs: 'Unsupported' as unknown as OperatingSystem,
        },
        {
          description: 'undefined OS',
          unknownOs: undefined,
        },
      ];
      testScenarios.forEach(({ description, unknownOs }) => {
        it(description, () => {
          // act
          const filename = generateFilenamePartsForTesting({ operatingSystem: unknownOs });
          // assert
          expect(filename.extension).toBeUndefined();
        });
      });
    });
  });
});

interface TestFileNameComponents {
  readonly prefix: string;
  readonly timestamp: string;
  readonly extension?: string;
  readonly generatedFileName: string;
}

function generateFilenamePartsForTesting(testScenario?: {
  operatingSystem?: OperatingSystem,
  date?: Date,
}): TestFileNameComponents {
  const date = testScenario?.date ?? new Date();
  const sut = new OsTimestampedFilenameGenerator(
    new RuntimeEnvironmentStub().withOs(testScenario?.operatingSystem),
  );
  const filename = sut.generateFilename(date);
  const pattern = /^(?<prefix>[^-]+)-(?<timestamp>[^.]+)(?:\.(?<extension>[^.]+))?$/; // prefix-timestamp.extension
  const match = filename.match(pattern);
  if (!match?.groups?.prefix || !match?.groups?.timestamp) {
    throw new Error(`Failed to parse prefix or timestamp: ${filename}`);
  }
  return {
    generatedFileName: filename,
    prefix: match.groups.prefix,
    timestamp: match.groups.timestamp,
    extension: match.groups.extension,
  };
}
