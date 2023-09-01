import { describe, it, expect } from 'vitest';
import { InjectionKeys } from '@/presentation/injectionSymbols';

describe('injectionSymbols', () => {
  Object.entries(InjectionKeys).forEach(([key, symbol]) => {
    describe(`symbol for ${key}`, () => {
      it('should be a symbol type', () => {
        // arrange
        const expectedType = Symbol;
        // act
        // assert
        expect(symbol).to.be.instanceOf(expectedType);
      });
      it(`should have a description matching the key "${key}"`, () => {
        // arrange
        const expected = key;
        // act
        const actual = symbol.description;
        // assert
        expect(expected).to.equal(actual);
      });
    });
  });
});
