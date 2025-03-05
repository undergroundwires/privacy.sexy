import { expect, describe, it } from 'vitest';
import { NewlineCodeSegmentMerger } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/CodeSegmentJoin/NewlineCodeSegmentMerger';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import { getAbsentStringTestCases, itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { CompiledCode } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';

describe('NewlineCodeSegmentMerger', () => {
  describe('mergeCodeParts', () => {
    describe('throws given empty segments', () => {
      itEachAbsentCollectionValue<CompiledCode>((absentValue) => {
        // arrange
        const expectedError = 'missing segments';
        const segments = absentValue;
        const merger = new NewlineCodeSegmentMerger();
        // act
        const act = () => merger.mergeCodeParts(segments);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true, excludeNull: true });
    });
    describe('merges correctly', () => {
      const testCases: ReadonlyArray<{
        readonly description: string,
        readonly segments: CompiledCodeStub[],
        readonly expected: {
          readonly code: string,
          readonly revertCode?: string,
        },
      }> = [
        {
          description: 'given `code` and `revertCode`',
          segments: [
            new CompiledCodeStub().withCode('code1').withRevertCode('revert1'),
            new CompiledCodeStub().withCode('code2').withRevertCode('revert2'),
            new CompiledCodeStub().withCode('code3').withRevertCode('revert3'),
          ],
          expected: {
            code: 'code1\ncode2\ncode3',
            revertCode: 'revert1\nrevert2\nrevert3',
          },
        },
        ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
          .map((absentTestCase) => ({
            description: `filter out ${absentTestCase.valueName} \`revertCode\``,
            segments: [
              new CompiledCodeStub().withCode('code1').withRevertCode('revert1'),
              new CompiledCodeStub().withCode('code2').withRevertCode(absentTestCase.absentValue),
              new CompiledCodeStub().withCode('code3').withRevertCode('revert3'),
            ],
            expected: {
              code: 'code1\ncode2\ncode3',
              revertCode: 'revert1\nrevert3',
            },
          })),
        ...getAbsentStringTestCases({ excludeNull: true })
          .map((emptyRevertCode) => ({
            description: `given only \`code\` in segments with "${emptyRevertCode.valueName}" \`revertCode\``,
            segments: [
              new CompiledCodeStub().withCode('code1').withRevertCode(emptyRevertCode.absentValue),
              new CompiledCodeStub().withCode('code2').withRevertCode(emptyRevertCode.absentValue),
            ],
            expected: {
              code: 'code1\ncode2',
              revertCode: '',
            },
          })),
        {
          description: 'given mix of segments with only `code` or `revertCode`',
          segments: [
            new CompiledCodeStub().withCode('code1').withRevertCode(''),
            new CompiledCodeStub().withCode('').withRevertCode('revert2'),
            new CompiledCodeStub().withCode('code3').withRevertCode(''),
          ],
          expected: {
            code: 'code1\ncode3',
            revertCode: 'revert2',
          },
        },
        {
          description: 'given only `revertCode` in segments',
          segments: [
            new CompiledCodeStub().withCode('').withRevertCode('revert1'),
            new CompiledCodeStub().withCode('').withRevertCode('revert2'),
          ],
          expected: {
            code: '',
            revertCode: 'revert1\nrevert2',
          },
        },
      ];
      for (const { segments, expected, description } of testCases) {
        it(description, () => {
          // arrange
          const merger = new NewlineCodeSegmentMerger();
          // act
          const actual = merger.mergeCodeParts(segments);
          // assert
          expect(actual.code).to.equal(expected.code);
          expect(actual.revertCode).to.equal(expected.revertCode);
        });
      }
    });
  });
});
