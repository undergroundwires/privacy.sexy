import 'mocha';
import { expect } from 'chai';
import { EnumType } from '@/application/Common/Enum';
import { itEachAbsentObjectValue } from '@tests/unit/common/AbsentTests';

export class EnumRangeTestRunner<TEnumValue extends EnumType> {
  constructor(private readonly runner: (value: TEnumValue) => void) {
  }

  public testOutOfRangeThrows() {
    it('throws when value is out of range', () => {
      // arrange
      const value = Number.MAX_SAFE_INTEGER as TEnumValue;
      const expectedError = `enum value "${value}" is out of range`;
      // act
      const act = () => this.runner(value);
      // assert
      expect(act).to.throw(expectedError);
    });
    return this;
  }

  public testAbsentValueThrows() {
    describe('throws when value is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const value = absentValue;
        const expectedError = 'absent enum value';
        // act
        const act = () => this.runner(value);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    return this;
  }

  public testInvalidValueThrows(invalidValue: TEnumValue, expectedError: string) {
    it(`throws ${expectedError}`, () => {
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
