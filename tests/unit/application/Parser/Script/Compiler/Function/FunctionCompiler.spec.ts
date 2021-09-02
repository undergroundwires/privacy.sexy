import 'mocha';
import { expect } from 'chai';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionData, ParameterDefinitionData } from 'js-yaml-loader!@/*';
import { IFunctionCallCompiler } from '@/application/Parser/Script/Compiler/FunctionCall/IFunctionCallCompiler';
import { FunctionCompiler } from '@/application/Parser/Script/Compiler/Function/FunctionCompiler';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionCallCompilerStub } from '@tests/unit/stubs/FunctionCallCompilerStub';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';
import { ParameterDefinitionDataStub } from '@tests/unit/stubs/ParameterDefinitionDataStub';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';

describe('FunctionsCompiler', () => {
    describe('compileFunctions', () => {
        describe('validates functions', () => {
            it('throws if one of the functions is undefined', () => {
                // arrange
                const expectedError = `some functions are undefined`;
                const functions = [ FunctionDataStub.createWithCode(), undefined ];
                const sut = new MockableFunctionCompiler();
                // act
                const act = () => sut.compileFunctions(functions);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when functions have same names', () => {
                // arrange
                const name = 'same-func-name';
                const expectedError = `duplicate function name: "${name}"`;
                const functions = [
                    FunctionDataStub.createWithCode().withName(name),
                    FunctionDataStub.createWithCode().withName(name),
                ];
                const sut = new MockableFunctionCompiler();
                // act
                const act = () => sut.compileFunctions(functions);
                // assert
                expect(act).to.throw(expectedError);
            });
            describe('throws when parameters type is not as expected', () => {
                const testCases = [
                    {
                        state: 'when not an array',
                        invalidType: 5,
                    },
                    {
                        state: 'when array but not of objects',
                        invalidType: [ 'a', { a: 'b'} ],
                    },
                ];
                for (const testCase of testCases) {
                    it(testCase.state, () => {
                        // arrange
                        const func = FunctionDataStub
                            .createWithCall()
                            .withParametersObject(testCase.invalidType as any);
                        const expectedError = `parameters must be an array of objects in function(s) "${func.name}"`;
                        const sut = new MockableFunctionCompiler();
                        // act
                        const act = () => sut.compileFunctions([ func ]);
                        // assert
                        expect(act).to.throw(expectedError);
                    });
                }
            });
            describe('throws when when function have duplicate code', () => {
                it('code', () => {
                    // arrange
                    const code = 'duplicate-code';
                    const expectedError = `duplicate "code" in functions: "${code}"`;
                    const functions = [
                        FunctionDataStub.createWithoutCallOrCodes().withName('func-1').withCode(code),
                        FunctionDataStub.createWithoutCallOrCodes().withName('func-2').withCode(code),
                    ];
                    const sut = new MockableFunctionCompiler();
                    // act
                    const act = () => sut.compileFunctions(functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('revertCode', () => {
                    // arrange
                    const revertCode = 'duplicate-revert-code';
                    const expectedError = `duplicate "revertCode" in functions: "${revertCode}"`;
                    const functions = [
                        FunctionDataStub.createWithoutCallOrCodes()
                            .withName('func-1').withCode('code-1').withRevertCode(revertCode),
                        FunctionDataStub.createWithoutCallOrCodes()
                            .withName('func-2').withCode('code-2').withRevertCode(revertCode),
                    ];
                    const sut = new MockableFunctionCompiler();
                    // act
                    const act = () => sut.compileFunctions(functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });
            it('both code and call are defined', () => {
                // arrange
                const functionName = 'invalid-function';
                const expectedError = `both "code" and "call" are defined in "${functionName}"`;
                const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
                    .withName(functionName)
                    .withCode('code')
                    .withMockCall();
                const sut = new MockableFunctionCompiler();
                // act
                const act = () => sut.compileFunctions([ invalidFunction ]);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('neither code and call is defined', () => {
                // arrange
                const functionName = 'invalid-function';
                const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
                const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
                    .withName(functionName);
                const sut = new MockableFunctionCompiler();
                // act
                const act = () => sut.compileFunctions([ invalidFunction ]);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('rethrows including function name when FunctionParameter throws', () => {
                // arrange
                const functionName = 'invalid-function';
                const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
                const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
                    .withName(functionName);
                const sut = new MockableFunctionCompiler();
                // act
                const act = () => sut.compileFunctions([ invalidFunction ]);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('rethrows including function name when FunctionParameter throws', () => {
                // arrange
                const invalidParameterName = 'invalid function p@r4meter name';
                const functionName = 'functionName';
                let parameterException: Error;
                // tslint:disable-next-line:no-unused-expression
                try { new FunctionParameter(invalidParameterName, false); } catch (e) { parameterException = e; }
                const expectedError = `"${functionName}": ${parameterException.message}`;
                const functionData = FunctionDataStub.createWithCode()
                    .withName(functionName)
                    .withParameters(new ParameterDefinitionDataStub().withName(invalidParameterName));

                // act
                const sut = new MockableFunctionCompiler();
                const act = () => sut.compileFunctions([ functionData ]);

                // assert
                expect(act).to.throw(expectedError);
            });
        });
        it('returns empty with empty functions', () => {
            // arrange
            const emptyValues = [ [], undefined ];
            const sut = new MockableFunctionCompiler();
            for (const emptyFunctions of emptyValues) {
                // act
                const actual = sut.compileFunctions(emptyFunctions);
                // assert
                expect(actual).to.not.equal(undefined);
            }
        });
        it('parses single function with code as expected', () => {
            // arrange
            const name = 'function-name';
            const expected = FunctionDataStub
                .createWithoutCallOrCodes()
                .withName(name)
                .withCode('expected-code')
                .withRevertCode('expected-revert-code')
                .withParameters(
                    new ParameterDefinitionDataStub().withName('expectedParameter').withOptionality(true),
                    new ParameterDefinitionDataStub().withName('expectedParameter2').withOptionality(false),
                );
            const sut = new MockableFunctionCompiler();
            // act
            const collection = sut.compileFunctions([ expected ]);
            // expect
            const actual = collection.getFunctionByName(name);
            expectEqualFunctions(expected, actual);
        });
        it('parses function with call as expected', () => {
            // arrange
            const calleeName = 'callee-function';
            const caller = FunctionDataStub.createWithoutCallOrCodes()
                .withName('caller-function')
                .withCall({ function: calleeName });
            const callee = FunctionDataStub.createWithoutCallOrCodes()
                .withName(calleeName)
                .withCode('expected-code')
                .withRevertCode('expected-revert-code');
            const sut = new MockableFunctionCompiler();
            // act
            const collection = sut.compileFunctions([ caller, callee ]);
            // expect
            const actual = collection.getFunctionByName(caller.name);
            expectEqualFunctionCode(callee, actual);
        });
        it('parses multiple functions with call as expected', () => {
            // arrange
            const calleeName = 'callee-function';
            const caller1 = FunctionDataStub.createWithoutCallOrCodes()
                .withName('caller-function')
                .withCall({ function: calleeName });
            const caller2 = FunctionDataStub.createWithoutCallOrCodes()
                .withName('caller-function-2')
                .withCall({ function: calleeName });
            const callee = FunctionDataStub.createWithoutCallOrCodes()
                .withName(calleeName)
                .withCode('expected-code')
                .withRevertCode('expected-revert-code');
            const sut = new MockableFunctionCompiler();
            // act
            const collection = sut.compileFunctions([ caller1, caller2, callee ]);
            // expect
            const compiledCaller1 = collection.getFunctionByName(caller1.name);
            const compiledCaller2 = collection.getFunctionByName(caller2.name);
            expectEqualFunctionCode(callee, compiledCaller1);
            expectEqualFunctionCode(callee, compiledCaller2);
        });
    });
});

function expectEqualFunctions(expected: FunctionData, actual: ISharedFunction) {
    expect(actual.name).to.equal(expected.name);
    expect(areScrambledEqual(actual.parameters, expected.parameters));
    expectEqualFunctionCode(expected, actual);
}

function expectEqualFunctionCode(expected: FunctionData, actual: ISharedFunction) {
    expect(actual.code).to.equal(expected.code);
    expect(actual.revertCode).to.equal(expected.revertCode);
}

function areScrambledEqual(
    expected: IReadOnlyFunctionParameterCollection,
    actual: readonly ParameterDefinitionData[],
) {
    if (expected.all.length !== actual.length) {
        return false;
    }
    for (const expectedParameter of expected.all) {
        if (!actual.some(
            (a) => a.name === expectedParameter.name
                && (a.optional || false) === expectedParameter.isOptional)) {
            return false;
        }
    }
    return true;
}

class MockableFunctionCompiler extends FunctionCompiler {
    constructor(functionCallCompiler: IFunctionCallCompiler = new FunctionCallCompilerStub()) {
        super(functionCallCompiler);
    }
}
