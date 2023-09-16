import { describe, it, expect } from 'vitest';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { createCallerFunction, createFunctionWithInlineCode } from '@/application/Parser/Script/Compiler/Function/SharedFunction';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { FunctionBodyType, ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import {
  getAbsentStringTestCases, itEachAbsentCollectionValue, itEachAbsentObjectValue,
  itEachAbsentStringValue,
} from '@tests/unit/shared/TestCases/AbsentTests';

describe('SharedFunction', () => {
  describe('SharedFunction', () => {
    describe('name', () => {
      runForEachFactoryMethod((build) => {
        it('sets as expected', () => {
          // arrange
          const expected = 'expected-function-name';
          const builder = new SharedFunctionBuilder()
            .withName(expected);
          // act
          const sut = build(builder);
          // assert
          expect(sut.name).equal(expected);
        });
        it('throws when absent', () => {
          itEachAbsentStringValue((absentValue) => {
            // arrange
            const expectedError = 'missing function name';
            const builder = new SharedFunctionBuilder()
              .withName(absentValue);
            // act
            const act = () => build(builder);
            // assert
            expect(act).to.throw(expectedError);
          });
        });
      });
    });
    describe('parameters', () => {
      runForEachFactoryMethod((build) => {
        it('sets as expected', () => {
          // arrange
          const expected = new FunctionParameterCollectionStub()
            .withParameterName('test-parameter');
          const builder = new SharedFunctionBuilder()
            .withParameters(expected);
          // act
          const sut = build(builder);
          // assert
          expect(sut.parameters).equal(expected);
        });
        describe('throws if missing', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const expectedError = 'missing parameters';
            const parameters = absentValue;
            const builder = new SharedFunctionBuilder()
              .withParameters(parameters);
            // act
            const act = () => build(builder);
            // assert
            expect(act).to.throw(expectedError);
          });
        });
      });
    });
  });
  describe('createFunctionWithInlineCode', () => {
    describe('code', () => {
      it('sets as expected', () => {
        // arrange
        const expected = 'expected-code';
        // act
        const sut = new SharedFunctionBuilder()
          .withCode(expected)
          .createFunctionWithInlineCode();
        // assert
        expect(sut.body.code.execute).equal(expected);
      });
      describe('throws if absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const functionName = 'expected-function-name';
          const expectedError = `undefined code in function "${functionName}"`;
          const invalidValue = absentValue;
          // act
          const act = () => new SharedFunctionBuilder()
            .withName(functionName)
            .withCode(invalidValue)
            .createFunctionWithInlineCode();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
    describe('revertCode', () => {
      it('sets as expected', () => {
        // arrange
        const testData = [
          'expected-revert-code',
          ...getAbsentStringTestCases().map((testCase) => testCase.absentValue),
        ];
        for (const data of testData) {
          // act
          const sut = new SharedFunctionBuilder()
            .withRevertCode(data)
            .createFunctionWithInlineCode();
          // assert
          expect(sut.body.code.revert).equal(data);
        }
      });
    });
    it('sets type as expected', () => {
      // arrange
      const expectedType = FunctionBodyType.Code;
      // act
      const sut = new SharedFunctionBuilder()
        .createFunctionWithInlineCode();
      // assert
      expect(sut.body.type).equal(expectedType);
    });
    it('calls are undefined', () => {
      // arrange
      const expectedCalls = undefined;
      // act
      const sut = new SharedFunctionBuilder()
        .createFunctionWithInlineCode();
      // assert
      expect(sut.body.calls).equal(expectedCalls);
    });
  });
  describe('createCallerFunction', () => {
    describe('rootCallSequence', () => {
      it('sets as expected', () => {
        // arrange
        const expected = [
          new FunctionCallStub().withFunctionName('firstFunction'),
          new FunctionCallStub().withFunctionName('secondFunction'),
        ];
        // act
        const sut = new SharedFunctionBuilder()
          .withRootCallSequence(expected)
          .createCallerFunction();
        // assert
        expect(sut.body.calls).equal(expected);
      });
      describe('throws if missing', () => {
        itEachAbsentCollectionValue((absentValue) => {
          // arrange
          const functionName = 'invalidFunction';
          const rootCallSequence = absentValue;
          const expectedError = `missing call sequence in function "${functionName}"`;
          // act
          const act = () => new SharedFunctionBuilder()
            .withName(functionName)
            .withRootCallSequence(rootCallSequence)
            .createCallerFunction();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
    it('sets type as expected', () => {
      // arrange
      const expectedType = FunctionBodyType.Calls;
      // act
      const sut = new SharedFunctionBuilder()
        .createCallerFunction();
      // assert
      expect(sut.body.type).equal(expectedType);
    });
    it('code is undefined', () => {
      // arrange
      const expectedCode = undefined;
      // act
      const sut = new SharedFunctionBuilder()
        .createCallerFunction();
      // assert
      expect(sut.body.code).equal(expectedCode);
    });
  });
});

function runForEachFactoryMethod(
  act: (action: (sut: SharedFunctionBuilder) => ISharedFunction) => void,
): void {
  describe('createCallerFunction', () => {
    const action = (builder: SharedFunctionBuilder) => builder.createCallerFunction();
    act(action);
  });
  describe('createFunctionWithInlineCode', () => {
    const action = (builder: SharedFunctionBuilder) => builder.createFunctionWithInlineCode();
    act(action);
  });
}

/*
  Using an abstraction here allows for easy refactorings in
  parameters or moving between functional and object-oriented
  solutions without refactorings all tests.
*/
class SharedFunctionBuilder {
  private name = 'name';

  private parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();

  private callSequence: readonly FunctionCall[] = [new FunctionCallStub()];

  private code = 'code';

  private revertCode = 'revert-code';

  public createCallerFunction(): ISharedFunction {
    return createCallerFunction(
      this.name,
      this.parameters,
      this.callSequence,
    );
  }

  public createFunctionWithInlineCode(): ISharedFunction {
    return createFunctionWithInlineCode(
      this.name,
      this.parameters,
      this.code,
      this.revertCode,
    );
  }

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
    this.parameters = parameters;
    return this;
  }

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string) {
    this.revertCode = revertCode;
    return this;
  }

  public withRootCallSequence(callSequence: readonly FunctionCall[]) {
    this.callSequence = callSequence;
    return this;
  }
}
