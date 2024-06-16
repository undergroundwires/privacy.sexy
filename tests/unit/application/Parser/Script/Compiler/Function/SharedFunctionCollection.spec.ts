import { describe, it, expect } from 'vitest';
import { SharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/SharedFunctionCollection';
import { createSharedFunctionStubWithCode, createSharedFunctionStubWithCalls } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('SharedFunctionCollection', () => {
  describe('addFunction', () => {
    it('throws if function with same name already exists', () => {
      // arrange
      const functionName = 'duplicate-function';
      const expectedError = `function with name ${functionName} already exists`;
      const func = createSharedFunctionStubWithCode()
        .withName('duplicate-function');
      const sut = new SharedFunctionCollection();
      sut.addFunction(func);
      // act
      const act = () => sut.addFunction(func);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('getFunctionByName', () => {
    describe('throws if name is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing function name';
        const sut = new SharedFunctionCollection();
        // act
        const act = () => sut.getFunctionByName(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
    it('throws if function does not exist', () => {
      // arrange
      const name = 'unique-name';
      const expectedError = `Called function is not defined: "${name}"`;
      const func = createSharedFunctionStubWithCode()
        .withName('unexpected-name');
      const sut = new SharedFunctionCollection();
      sut.addFunction(func);
      // act
      const act = () => sut.getFunctionByName(name);
      // assert
      expect(act).to.throw(expectedError);
    });
    describe('returns existing function', () => {
      it('when function with inline code is added', () => {
        // arrange
        const expected = createSharedFunctionStubWithCode()
          .withName('expected-function-name');
        const sut = new SharedFunctionCollection();
        // act
        sut.addFunction(expected);
        const actual = sut.getFunctionByName(expected.name);
        // assert
        expect(actual).to.equal(expected);
      });
      it('when calling function is added', () => {
        // arrange
        const callee = createSharedFunctionStubWithCode()
          .withName('calleeFunction');
        const caller = createSharedFunctionStubWithCalls()
          .withName('callerFunction')
          .withCalls(new FunctionCallStub().withFunctionName(callee.name));
        const sut = new SharedFunctionCollection();
        // act
        sut.addFunction(callee);
        sut.addFunction(caller);
        const actual = sut.getFunctionByName(caller.name);
        // assert
        expect(actual).to.equal(caller);
      });
    });
  });
});
