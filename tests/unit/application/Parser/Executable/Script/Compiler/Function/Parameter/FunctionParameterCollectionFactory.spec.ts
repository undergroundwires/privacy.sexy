import { describe, it, expect } from 'vitest';
import { FunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { createFunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollectionFactory';
import { itIsTransientFactory } from '@tests/unit/shared/TestCases/TransientFactoryTests';

describe('FunctionParameterCollectionFactory', () => {
  describe('createFunctionParameterCollection', () => {
    describe('it is a transient factory', () => {
      itIsTransientFactory({
        getter: () => createFunctionParameterCollection(),
        expectedType: FunctionParameterCollection,
      });
    });
    it('returns an empty collection', () => {
      // arrange
      const expectedInitialParametersCount = 0;
      // act
      const collection = createFunctionParameterCollection();
      // assert
      expect(collection.all).to.have.lengthOf(expectedInitialParametersCount);
    });
  });
});
