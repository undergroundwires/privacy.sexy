import { describe, it } from 'vitest';
import { NodeDataError, NodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { getAbsentObjectTestCases, getAbsentStringTestCases, itEachAbsentTestCase } from '@tests/unit/shared/TestCases/AbsentTests';
import { expectDeepThrowsError } from '@tests/shared/Assertions/ExpectDeepThrowsError';

export interface NodeValidationTestScenario {
  readonly act: () => void;
  readonly expectedContext: NodeDataErrorContext;
}

export class NodeValidationTestRunner {
  public testInvalidName(
    testBuildPredicate: (invalidName: string) => NodeValidationTestScenario,
  ): this {
    describe('throws given invalid names', () => {
      // arrange
      const testCases: ReadonlyArray<{
        readonly description: string;
        readonly nameValue: unknown;
        readonly expectedMessage: string;
      }> = [
        ...getAbsentStringTestCases().map((testCase) => ({
          description: `missing name (${testCase.valueName})`,
          nameValue: testCase.absentValue,
          expectedMessage: 'missing name',
        })),
        {
          description: 'invalid type',
          nameValue: 33,
          expectedMessage: 'Name (33) is not a string but number.',
        },
      ];
      for (const testCase of testCases) {
        it(`given "${testCase.description}"`, () => {
          const test = testBuildPredicate(testCase.nameValue as never);
          expectThrowsNodeError(test, testCase.expectedMessage);
        });
      }
    });
    return this;
  }

  public testInvalidId(
    testBuildPredicate: (invalidName: string) => NodeValidationTestScenario,
  ): this {
    describe('throws given invalid IDs', () => {
      // arrange
      const testCases: ReadonlyArray<{
        readonly description: string;
        readonly idValue: unknown;
        readonly expectedMessage: string;
      }> = [
        ...getAbsentStringTestCases().map((testCase) => ({
          description: `missing id (${testCase.valueName})`,
          idValue: testCase.absentValue,
          expectedMessage: 'missing id',
        })),
        {
          description: 'invalid type',
          idValue: 33,
          expectedMessage: 'ID (33) is not a string but number.',
        },
      ];
      for (const testCase of testCases) {
        it(`given "${testCase.description}"`, () => {
          const test = testBuildPredicate(testCase.idValue as never);
          expectThrowsNodeError(test, testCase.expectedMessage);
        });
      }
    });
    return this;
  }

  public testMissingData(
    testBuildPredicate: (missingNode: NodeData) => NodeValidationTestScenario,
  ): this {
    describe('throws given missing node data', () => {
      itEachAbsentTestCase([
        ...getAbsentObjectTestCases(),
        {
          valueName: 'empty object',
          absentValue: {},
        },
      ], (absentValue) => {
        // arrange
        const expectedError = 'missing node data';
        // act
        const test = testBuildPredicate(absentValue as NodeData);
        // assert
        expectThrowsNodeError(test, expectedError);
      });
    });
    return this;
  }

  public runThrowingCase(
    testCase: {
      readonly description: string,
      readonly scenario: NodeValidationTestScenario,
      readonly expectedMessage: string
    },
  ): this {
    it(testCase.description, () => {
      expectThrowsNodeError(testCase.scenario, testCase.expectedMessage);
    });
    return this;
  }
}

export function expectThrowsNodeError(
  test: NodeValidationTestScenario,
  expectedMessage: string,
) {
  // arrange
  const expected = new NodeDataError(expectedMessage, test.expectedContext);
  // act
  const act = () => test.act();
  // assert
  expectDeepThrowsError(act, expected);
  return this;
}
