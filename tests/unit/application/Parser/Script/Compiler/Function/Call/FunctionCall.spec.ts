import 'mocha';
import { expect } from 'chai';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';

describe('FunctionCall', () => {
  describe('ctor', () => {
    describe('args', () => {
      it('throws when args is undefined', () => {
        // arrange
        const expectedError = 'undefined args';
        const args = undefined;
        // act
        const act = () => new FunctionCallBuilder()
          .withArgs(args)
          .build();
        // assert
        expect(act).to.throw(expectedError);
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
      it('throws when function name is undefined', () => {
        // arrange
        const expectedError = 'empty function name in function call';
        const functionName = undefined;
        // act
        const act = () => new FunctionCallBuilder()
          .withFunctionName(functionName)
          .build();
        // assert
        expect(act).to.throw(expectedError);
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
