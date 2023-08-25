import { describe } from 'vitest';
import { FactoryValidator, FactoryFunction } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('FactoryValidator', () => {
  describe('ctor', () => {
    describe('throws when factory is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing factory';
        const factory = absentValue;
        // act
        const act = () => new TestableFactoryValidator(factory);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('collectErrors', () => {
    it('reports error thrown by factory function', () => {
      // arrange
      const errorFromFactory = 'Error from factory function';
      const expectedError = `Error in factory creation: ${errorFromFactory}`;
      const factory: FactoryFunction<number | undefined> = () => {
        throw new Error(errorFromFactory);
      };
      const sut = new TestableFactoryValidator(factory);
      // act
      const errors = [...sut.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.equal(expectedError);
    });
    describe('reports when factory returns falsy values', () => {
      const falsyValueTestCases = [
        {
          name: '`false` boolean',
          value: false,
        },
        {
          name: 'number zero',
          value: 0,
        },
        {
          name: 'empty string',
          value: '',
        },
        {
          name: 'null',
          value: null,
        },
        {
          name: 'undefined',
          value: undefined,
        },
        {
          name: 'NaN (Not-a-Number)',
          value: Number.NaN,
        },
      ];
      falsyValueTestCases.forEach(({ name, value }) => {
        it(`reports for value: ${name}`, () => {
          // arrange
          const errorFromFactory = 'Factory resulted in a falsy value';
          const factory: FactoryFunction<number | undefined> = () => {
            return value as never;
          };
          const sut = new TestableFactoryValidator(factory);
          // act
          const errors = [...sut.collectErrors()];
          // assert
          expect(errors).to.have.lengthOf(1);
          expect(errors[0]).to.equal(errorFromFactory);
        });
      });
    });
    it('does not report when factory returns a truthy value', () => {
      // arrange
      const factory: FactoryFunction<number | undefined> = () => {
        return 35;
      };
      const sut = new TestableFactoryValidator(factory);
      // act
      const errors = [...sut.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(0);
    });
    it('executes factory for each method call', () => {
      // arrange
      let forceFalsyValue = false;
      const complexFactory: FactoryFunction<number | undefined> = () => {
        return forceFalsyValue ? undefined : 42;
      };
      const sut = new TestableFactoryValidator(complexFactory);
      // act
      const firstErrors = [...sut.collectErrors()];
      forceFalsyValue = true;
      const secondErrors = [...sut.collectErrors()];
      // assert
      expect(firstErrors).to.have.lengthOf(0);
      expect(secondErrors).to.have.lengthOf(1);
    });
  });
});

class TestableFactoryValidator extends FactoryValidator<number | undefined> {
  public constructor(factory: FactoryFunction<number | undefined>) {
    super(factory);
  }

  public name = 'test';

  public shouldValidate(): boolean {
    return true;
  }
}
