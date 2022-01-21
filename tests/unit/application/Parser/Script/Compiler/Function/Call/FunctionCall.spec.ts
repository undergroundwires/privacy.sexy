import 'mocha';
import { expect } from 'chai';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';
import { itEachAbsentObjectValue, itEachAbsentStringValue } from '@tests/unit/common/AbsentTests';

describe('FunctionCall', () => {
  describe('ctor', () => {
    describe('args', () => {
      describe('throws when args is missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing args';
          const args = absentValue;
          // act
          const act = () => new FunctionCallBuilder()
            .withArgs(args)
            .build();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
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
        });
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
    return new FunctionCall(this.functionName, this.args);
  }
}
