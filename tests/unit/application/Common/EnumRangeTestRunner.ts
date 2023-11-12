import { it, expect } from 'vitest';
import { EnumType } from '@/application/Common/Enum';

export class EnumRangeTestRunner<TEnumValue extends EnumType> {
  constructor(private readonly runner: (value: TEnumValue) => void) {
  }

  public testOutOfRangeThrows(errorMessageBuilder?: (outOfRangeValue: TEnumValue) => string) {
    it('throws when value is out of range', () => {
      // arrange
      const value = Number.MAX_SAFE_INTEGER as TEnumValue;
      const expectedError = errorMessageBuilder
        ? errorMessageBuilder(value)
        : `enum value "${value}" is out of range`;
      // act
      const act = () => this.runner(value);
      // assert
      expect(act).to.throw(expectedError);
    });
    return this;
  }

  public testInvalidValueThrows(invalidValue: TEnumValue, expectedError: string) {
    it(`throws: \`${expectedError}\``, () => {
      // arrange
      const value = invalidValue;
      // act
      const act = () => this.runner(value);
      // assert
      expect(act).to.throw(expectedError);
    });
    return this;
  }

  public testValidValueDoesNotThrow(validValue: TEnumValue) {
    it('does not throw with valid value', () => {
      // arrange
      const value = validValue;
      // act
      const act = () => this.runner(value);
      // assert
      expect(act).to.not.throw();
    });
    return this;
  }
}
