import { describe, it, expect } from 'vitest';
import { ParsedFunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/ParsedFunctionCall';
import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ParsedFunctionCall', () => {
  describe('ctor', () => {
    describe('args', () => {
      it('sets args as expected', () => {
        // arrange
        const expected = new FunctionCallArgumentCollectionStub()
          .withArgument('testParameter', 'testValue');
        // act
        const sut = new FunctionCallBuilder()
          .withArgs(expected)
          .build();
        // assert
        expect(sut.args).to.deep.equal(expected);
      });
    });
    describe('functionName', () => {
      describe('throws when function name is missing', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing function name in function call';
          const functionName = absentValue;
          // act
          const act = () => new FunctionCallBuilder()
            .withFunctionName(functionName)
            .build();
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
      it('sets function name as expected', () => {
        // arrange
        const expected = 'expectedFunctionName';
        // act
        const sut = new FunctionCallBuilder()
          .withFunctionName(expected)
          .build();
        // assert
        expect(sut.functionName).to.equal(expected);
      });
    });
  });
});

class FunctionCallBuilder {
  private functionName = 'functionName';

  private args: IReadOnlyFunctionCallArgumentCollection = new FunctionCallArgumentCollectionStub();

  public withFunctionName(functionName: string) {
    this.functionName = functionName;
    return this;
  }

  public withArgs(args: IReadOnlyFunctionCallArgumentCollection) {
    this.args = args;
    return this;
  }

  public build() {
    return new ParsedFunctionCall(this.functionName, this.args);
  }
}
