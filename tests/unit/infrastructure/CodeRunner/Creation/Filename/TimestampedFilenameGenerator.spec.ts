import { describe, it, expect } from 'vitest';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { TimestampedFilenameGenerator } from '@/infrastructure/CodeRunner/Creation/Filename/TimestampedFilenameGenerator';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('TimestampedFilenameGenerator', () => {
  describe('generateFilename', () => {
    describe('script name', () => {
      it('uses correct script name', () => {
        // arrange
        const expectedScriptName = 'test-script';
        // act
        const filename = generateFilenamePartsForTesting({
          scriptName: expectedScriptName,
        });
        // assert
        expect(filename.scriptName).to.equal(expectedScriptName);
      });
      describe('error for missing script name', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'Script name is required but not provided.';
          // act
          const act = () => generateFilenamePartsForTesting({
            scriptName: absentValue,
          });
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
    it('generates expected timestamp', () => {
      // arrange
      const currentDate = '2023-01-01T12:00:00.000Z';
      const expectedTimestamp = '2023-01-01_12-00-00';
      const date = new Date(currentDate);
      // act
      const filename = generateFilenamePartsForTesting({ date });
      // assert
      expect(filename.timestamp).to.equal(expectedTimestamp, formatAssertionMessage([
        `Generated filename: ${filename.generatedFilename}`,
      ]));
    });
    describe('extension', () => {
      it('uses correct extension', () => {
        // arrange
        const expectedExtension = 'sexy';
        // act
        const filename = generateFilenamePartsForTesting({ extension: expectedExtension });
        // assert
        expect(filename.extension).to.equal(expectedExtension, formatAssertionMessage([
          `Generated filename: ${filename.generatedFilename}`,
        ]));
      });
      describe('handles absent extension', () => {
        itEachAbsentStringValue((absentExtension) => {
          // arrange
          const expectedExtension = undefined;
          // act
          const filename = generateFilenamePartsForTesting({ extension: absentExtension });
          // assert
          expect(filename.extension).to.equal(expectedExtension, formatAssertionMessage([
            `Generated file name: ${filename.generatedFilename}`,
          ]));
        }, { excludeNull: true });
      });
      it('errors on dot-starting extension', () => {
        // arrange
        const invalidExtension = '.sexy';
        const expectedError = 'File extension should not start with a dot.';
        // act
        const act = () => generateFilenamePartsForTesting({ extension: invalidExtension });
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

interface TestFileNameComponents {
  readonly scriptName: string;
  readonly timestamp: string;
  readonly extension?: string;
  readonly generatedFilename: string;
}

function generateFilenamePartsForTesting(testScenario?: {
  readonly date?: Date,
  readonly extension?: string,
  readonly scriptName?: string,
}): TestFileNameComponents {
  const date = testScenario?.date ?? new Date();
  const sut = new TimestampedFilenameGenerator();
  const filename = sut.generateFilename(
    {
      scriptName: testScenario?.scriptName ?? 'privacy-script',
      scriptFileExtension: testScenario?.extension,
    },
    date,
  );
  return parseFilename(filename);
}

function parseFilename(generatedFilename: string): TestFileNameComponents {
  const pattern = /^(?<timestamp>\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})-(?<scriptName>[^.]+?)(?:\.(?<extension>[^.]+))?$/;// timestamp-scriptName.extension
  const match = generatedFilename.match(pattern);
  function assertMatch(name: string, value: string | undefined): asserts value is string {
    if (!value) {
      throw new Error([
        `Missing "${name}" match in generated filename.`,
        `Generated filename: ${generatedFilename}`,
        `Match object: ${JSON.stringify(match)}`,
      ].join('\n'));
    }
  }
  assertMatch('script name', match?.groups?.scriptName);
  assertMatch('timestamp', match?.groups?.timestamp);
  return {
    generatedFilename,
    scriptName: match.groups.scriptName,
    timestamp: match.groups.timestamp,
    extension: match.groups.extension,
  };
}
