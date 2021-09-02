import 'mocha';
import { expect } from 'chai';
import { SharedFunction } from '@/application/Parser/Script/Compiler/Function/SharedFunction';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollectionStub } from '@tests/unit/stubs/FunctionParameterCollectionStub';

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
            const expected = new FunctionParameterCollectionStub()
                .withParameterName('test-parameter');
            // act
            const sut = new SharedFunctionBuilder()
                .withParameters(expected)
                .build();
            // assert
            expect(sut.parameters).to.equal(expected);
        });
        it('throws if undefined', () => {
            // arrange
            const expectedError = 'undefined parameters';
            const parameters = undefined;
            // act
            const act = () => new SharedFunctionBuilder()
                .withParameters(parameters)
                .build();
            // assert
            expect(act).to.throw(expectedError);
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
    private parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();
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
    public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
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
