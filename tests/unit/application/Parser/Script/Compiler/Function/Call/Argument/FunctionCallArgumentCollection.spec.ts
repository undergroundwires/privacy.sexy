import { describe, it, expect } from 'vitest';
import { FunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { FunctionCallArgumentStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { IFunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgument';

describe('FunctionCallArgumentCollection', () => {
  describe('addArgument', () => {
    it('throws if parameter value is already provided', () => {
      // arrange
      const duplicateParameterName = 'duplicateParam';
      const errorMessage = `argument value for parameter ${duplicateParameterName} is already provided`;
      const arg1 = new FunctionCallArgumentStub().withParameterName(duplicateParameterName);
      const arg2 = new FunctionCallArgumentStub().withParameterName(duplicateParameterName);
      const sut = new FunctionCallArgumentCollection();
      // act
      sut.addArgument(arg1);
      const act = () => sut.addArgument(arg2);
      // assert
      expect(act).to.throw(errorMessage);
    });
  });
  describe('getAllParameterNames', () => {
    describe('returns as expected', () => {
      // arrange
      const testCases: ReadonlyArray<{
        readonly description: string;
        readonly args: readonly IFunctionCallArgument[];
        readonly expectedParameterNames: string[];
      }> = [{
        description: 'no args',
        args: [],
        expectedParameterNames: [],
      }, {
        description: 'with some args',
        args: [
          new FunctionCallArgumentStub().withParameterName('a-param-name'),
          new FunctionCallArgumentStub().withParameterName('b-param-name')],
        expectedParameterNames: ['a-param-name', 'b-param-name'],
      }];
      for (const testCase of testCases) {
        it(testCase.description, () => {
          const sut = new FunctionCallArgumentCollection();
          // act
          for (const arg of testCase.args) {
            sut.addArgument(arg);
          }
          const actual = sut.getAllParameterNames();
          // assert
          expect(actual).to.deep.equal(testCase.expectedParameterNames);
        });
      }
    });
  });
  describe('getArgument', () => {
    describe('throws if parameter name is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing parameter name';
        const sut = new FunctionCallArgumentCollection();
        const parameterName = absentValue;
        // act
        const act = () => sut.getArgument(parameterName);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
    it('throws if argument does not exist', () => {
      // arrange
      const parameterName = 'nonExistingParam';
      const expectedError = `parameter does not exist: ${parameterName}`;
      const sut = new FunctionCallArgumentCollection();
      // act
      const act = () => sut.getArgument(parameterName);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('returns argument as expected', () => {
      // arrange
      const expected = new FunctionCallArgumentStub()
        .withParameterName('expectedName')
        .withArgumentValue('expectedValue');
      const sut = new FunctionCallArgumentCollection();
      // act
      sut.addArgument(expected);
      const actual = sut.getArgument(expected.parameterName);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('hasArgument', () => {
    describe('throws if parameter name is missing', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing parameter name';
        const parameterName = absentValue;
        const sut = new FunctionCallArgumentCollection();
        // act
        const act = () => sut.hasArgument(parameterName);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
    describe('returns as expected', () => {
      // arrange
      const testCases = [{
        name: 'argument exists',
        parameter: 'existing-parameter-name',
        args: [
          new FunctionCallArgumentStub().withParameterName('existing-parameter-name'),
          new FunctionCallArgumentStub().withParameterName('unrelated-parameter-name'),
        ],
        expected: true,
      },
      {
        name: 'argument does not exist',
        parameter: 'not-existing-parameter-name',
        args: [
          new FunctionCallArgumentStub().withParameterName('unrelated-parameter-name-b'),
          new FunctionCallArgumentStub().withParameterName('unrelated-parameter-name-a'),
        ],
        expected: false,
      }];
      for (const testCase of testCases) {
        it(`"${testCase.name}" returns "${testCase.expected}"`, () => {
          const sut = new FunctionCallArgumentCollection();
          // act
          for (const arg of testCase.args) {
            sut.addArgument(arg);
          }
          const actual = sut.hasArgument(testCase.parameter);
          // assert
          expect(actual).to.equal(testCase.expected);
        });
      }
    });
  });
});
