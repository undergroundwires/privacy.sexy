import { describe, it, expect } from 'vitest';
import { type InjectionKeySelector, InjectionKeys, injectKey } from '@/presentation/injectionSymbols';
import { getAbsentObjectTestCases } from '../shared/TestCases/AbsentTests';

describe('injectionSymbols', () => {
  describe('InjectionKeys', () => {
    Object.entries(InjectionKeys).forEach(([key, injectionKey]) => {
      describe(`symbol for ${injectionKey.key.toString()}`, () => {
        it('should be a symbol type', () => {
          // arrange
          const actualKey = injectionKey.key;
          const expectedType = Symbol;
          // act
          // assert
          expect(actualKey).to.be.instanceOf(expectedType);
        });
        it(`should have a description matching the key "${injectionKey.key.toString()}"`, () => {
          // arrange
          const actualKey = injectionKey.key;
          const expected = key;
          // act
          const actual = actualKey.description;
          // assert
          expect(expected).to.equal(actual);
        });
      });
    });
  });
  describe('injectKey', () => {
    it('returns the correct value for singleton keys', () => {
      // arrange
      const mockValue = { someProperty: 'someValue' };
      // act
      const mockInject = () => mockValue;
      const result = injectKey((keys) => keys.useApplication, mockInject);
      // assert
      expect(result).to.equal(mockValue);
    });
    it('invokes and returns result from factory function for transient keys', () => {
      // arrange
      const mockValue = { anotherProperty: 'anotherValue' };
      const mockFactory = () => mockValue;
      const mockInject = () => mockFactory;
      // act
      const result = injectKey((keys) => keys.useCollectionState, mockInject);
      // assert
      expect(result).to.equal(mockValue);
    });
    describe('throws error when no value is provided for a key', () => {
      // arrange
      const testScenarios: ReadonlyArray<{
        readonly name: string,
        readonly act: (selector: InjectionKeySelector<unknown>) => void,
      }> = getAbsentObjectTestCases().flatMap((absentTest) => [
        {
          name: `singleton factory: ${absentTest.absentValue}`,
          act: (selector) => injectKey(selector, () => (() => absentTest.absentValue)),
        },
        {
          name: `transient: ${absentTest.absentValue}`,
          act: (selector) => injectKey(selector, () => absentTest.absentValue),
        },
      ]);
      testScenarios.forEach((testCase) => {
        it(testCase.name, () => {
          // arrange
          const key = InjectionKeys.useRuntimeEnvironment;
          const expectedError = `Failed to inject value for key: ${key.key.description}`;
          const selector: InjectionKeySelector<typeof key> = () => key;
          // act
          const act = () => testCase.act(selector);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
  });
});
