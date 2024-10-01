import { describe, it, expect } from 'vitest';
import { filterEmptyStrings, type OptionalString } from '@/application/Common/Text/FilterEmptyStrings';
import { IsArrayStub } from '@tests/unit/shared/Stubs/IsArrayStub';
import type { isArray } from '@/TypeHelpers';

describe('filterEmptyStrings', () => {
  describe('filtering behavior', () => {
    // arrange
    const testScenarios: readonly {
      readonly description: string;
      readonly texts: readonly OptionalString[];
      readonly expected: readonly string[];
    }[] = [
      {
        description: 'filters out non-string entries',
        texts: ['Hello', '', 'World', null, 'Test', undefined],
        expected: ['Hello', 'World', 'Test'],
      },
      {
        description: 'returns empty array for no valid strings',
        texts: [null, undefined, ''],
        expected: [],
      },
      {
        description: 'preserves all valid strings',
        texts: ['Hello', 'World', 'Test'],
        expected: ['Hello', 'World', 'Test'],
      },
    ];
    testScenarios.forEach(({
      description, texts, expected,
    }) => {
      it(description, () => {
        const context = new TestContext()
          .withTexts(texts);
        // act
        const result = context.filterEmptyStrings();
        // assert
        expect(result).to.deep.equal(expected);
      });
    });
  });

  describe('error handling', () => {
    it('throws for non-array input', () => {
      // arrange
      const nonArrayInput = 'Hello';
      const isArray = new IsArrayStub()
        .withPredeterminedResult(false)
        .get();
      const expectedErrorMessage = `Invalid input: Expected an array, but received type ${typeof nonArrayInput}.`;
      const context = new TestContext()
        .withTexts(nonArrayInput as unknown as OptionalString[])
        .withIsArrayType(isArray);
      // act
      const act = () => context.filterEmptyStrings();
      // assert
      expect(act).toThrow(expectedErrorMessage);
    });

    it('throws for invalid item types in array', () => {
      // arrange
      const invalidInput: unknown[] = ['Hello', 42, 'World']; // Number is invalid
      const expectedErrorMessage = 'Invalid array items: Expected items as string, undefined, or null. Received invalid types: number.';
      const context = new TestContext()
        .withTexts(invalidInput as OptionalString[]);
      // act
      const act = () => context.filterEmptyStrings();
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });
  });
});

class TestContext {
  private texts: readonly OptionalString[] = [
    `[${TestContext.name}] text to stay after filtering`,
  ];

  private isArrayType: typeof isArray = new IsArrayStub()
    .get();

  public withTexts(texts: readonly OptionalString[]): this {
    this.texts = texts;
    return this;
  }

  public withIsArrayType(isArrayType: typeof isArray): this {
    this.isArrayType = isArrayType;
    return this;
  }

  public filterEmptyStrings(): ReturnType<typeof filterEmptyStrings> {
    return filterEmptyStrings(
      this.texts,
      this.isArrayType,
    );
  }
}
