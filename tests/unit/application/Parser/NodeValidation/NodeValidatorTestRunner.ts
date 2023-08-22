import { describe, it } from 'vitest';
import { NodeDataError, INodeDataErrorContext } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeData } from '@/application/Parser/NodeValidation/NodeData';
import { AbsentObjectTestCases, AbsentStringTestCases, itEachAbsentTestCase } from '@tests/unit/shared/TestCases/AbsentTests';
import { expectThrowsError } from '@tests/unit/shared/Assertions/ExpectThrowsError';

export interface ITestScenario {
  readonly act: () => void;
  readonly expectedContext: INodeDataErrorContext;
}

export class NodeValidationTestRunner {
  public testInvalidNodeName(
    testBuildPredicate: (invalidName: string) => ITestScenario,
  ) {
    describe('throws given invalid names', () => {
      // arrange
      const testCases = [
        ...AbsentStringTestCases.map((testCase) => ({
          testName: `missing name (${testCase.valueName})`,
          nameValue: testCase.absentValue,
          expectedMessage: 'missing name',
        })),
        {
          testName: 'invalid type',
          nameValue: 33,
          expectedMessage: 'Name (33) is not a string but number.',
        },
      ];
      for (const testCase of testCases) {
        it(`given "${testCase.testName}"`, () => {
          const test = testBuildPredicate(testCase.nameValue as never);
          expectThrowsNodeError(test, testCase.expectedMessage);
        });
      }
    });
    return this;
  }

  public testMissingNodeData(
    testBuildPredicate: (missingNode: NodeData) => ITestScenario,
  ) {
    describe('throws given missing node data', () => {
      itEachAbsentTestCase([
        ...AbsentObjectTestCases,
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
      readonly name: string,
      readonly scenario: ITestScenario,
      readonly expectedMessage: string
    },
  ) {
    it(testCase.name, () => {
      expectThrowsNodeError(testCase.scenario, testCase.expectedMessage);
    });
    return this;
  }
}

export function expectThrowsNodeError(
  test: ITestScenario,
  expectedMessage: string,
) {
  // arrange
  const expected = new NodeDataError(expectedMessage, test.expectedContext);
  // act
  const act = () => test.act();
  // assert
  expectThrowsError(act, expected);
  return this;
}
