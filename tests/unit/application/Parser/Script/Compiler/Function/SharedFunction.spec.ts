import 'mocha';
import { expect } from 'chai';
import { SharedFunction } from '@/application/Parser/Script/Compiler/Function/SharedFunction';

describe('SharedFunction', () => {
    describe('name', () => {
        it('sets as expected', () => {
            // arrange
            const expected = 'expected-function-name';
            // act
            const sut = new SharedFunctionBuilder()
                .withName(expected)
                .build();
            // assert
            expect(sut.name).equal(expected);
        });
        it('throws if empty or undefined', () => {
            // arrange
            const expectedError = 'undefined function name';
            const invalidValues = [ undefined, '' ];
            for (const invalidValue of invalidValues) {
                // act
                const act = () => new SharedFunctionBuilder()
                    .withName(invalidValue)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            }
        });
    });
    describe('parameters', () => {
        it('sets as expected', () => {
            // arrange
            const expected = [ 'expected-parameter' ];
            // act
            const sut = new SharedFunctionBuilder()
                .withParameters(expected)
                .build();
            // assert
            expect(sut.parameters).to.deep.equal(expected);
        });
        it('returns empty array if undefined', () => {
            // arrange
            const expected = [ ];
            const value = undefined;
            // act
            const sut = new SharedFunctionBuilder()
                .withParameters(value)
                .build();
            // assert
            expect(sut.parameters).to.not.equal(undefined);
            expect(sut.parameters).to.deep.equal(expected);
        });
    });
    describe('code', () => {
        it('sets as expected', () => {
            // arrange
            const expected = 'expected-code';
            // act
            const sut = new SharedFunctionBuilder()
                .withCode(expected)
                .build();
            // assert
            expect(sut.code).equal(expected);
        });
        it('throws if empty or undefined', () => {
            // arrange
            const functionName = 'expected-function-name';
            const expectedError = `undefined function ("${functionName}") code`;
            const invalidValues = [ undefined, '' ];
            for (const invalidValue of invalidValues) {
                // act
                const act = () => new SharedFunctionBuilder()
                    .withName(functionName)
                    .withCode(invalidValue)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            }
        });
    });
    describe('revertCode', () => {
        it('sets as expected', () => {
            // arrange
            const testData = [ 'expected-revert-code', undefined, '' ];
            for (const data of testData) {
                // act
                const sut = new SharedFunctionBuilder()
                    .withRevertCode(data)
                    .build();
                // assert
                expect(sut.revertCode).equal(data);
            }
        });
    });
});

class SharedFunctionBuilder {
    private name = 'name';
    private parameters: readonly string[] = [ 'parameter' ];
    private code = 'code';
    private revertCode = 'revert-code';

    public build(): SharedFunction {
        return new SharedFunction(
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
    public withParameters(parameters: readonly string[]) {
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
}
