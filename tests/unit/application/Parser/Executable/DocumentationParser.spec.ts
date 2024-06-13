import { describe, it, expect } from 'vitest';
import type { DocumentableData } from '@/application/collections/';
import { parseDocs } from '@/application/Parser/Executable/DocumentationParser';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('DocumentationParser', () => {
  describe('parseDocs', () => {
    describe('throws when single documentation is missing', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing documentation';
        const data: DocumentableData = { docs: ['non empty doc 1', absentValue] };
        // act
        const act = () => parseDocs(data);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
    describe('throws when type is unexpected', () => {
      // arrange
      const expectedTypeError = 'docs field (documentation) must be a single string or an array of strings.';
      const wrongTypedValue = 22 as never;
      const testCases: ReadonlyArray<{
        readonly name: string;
        readonly data: DocumentableData;
      }> = [
        {
          name: 'given docs',
          data: { docs: wrongTypedValue },
        },
        {
          name: 'single doc',
          data: { docs: ['non empty doc 1', wrongTypedValue] },
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          // act
          const act = () => parseDocs(testCase.data);
          // assert
          expect(act).to.throw(expectedTypeError);
        });
      }
    });
    it('returns empty when empty', () => {
      // arrange
      const empty: DocumentableData = { };
      // act
      const actual = parseDocs(empty);
      // assert
      expect(actual).to.have.lengthOf(0);
    });
    it('returns single item when string', () => {
      // arrange
      const url = 'https://privacy.sexy';
      const expected = [url];
      const sut: DocumentableData = { docs: url };
      // act
      const actual = parseDocs(sut);
      // assert
      expect(actual).to.deep.equal(expected);
    });
    it('returns all when array', () => {
      // arrange
      const expected = ['https://privacy.sexy', 'https://github.com/undergroundwires/privacy.sexy'];
      const sut: DocumentableData = { docs: expected };
      // act
      const actual = parseDocs(sut);
      // assert
      expect(actual).to.deep.equal(expected);
    });
  });
});
