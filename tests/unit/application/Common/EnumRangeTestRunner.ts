import 'mocha';
import { expect } from 'chai';
import { EnumType } from '@/application/Common/Enum';

export class EnumRangeTestRunner<TEnumValue extends EnumType> {
    constructor(private readonly runner: (value: TEnumValue) => any) {
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
    public testUndefinedValueThrows() {
        it('throws when value is undefined', () => {
            // arrange
            const value = undefined;
            const expectedError = 'undefined enum value';
            // act
            const act = () => this.runner(value);
            // assert
            expect(act).to.throw(expectedError);
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
        it('throws when value is undefined', () => {
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
