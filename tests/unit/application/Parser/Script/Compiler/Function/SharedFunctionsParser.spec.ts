import 'mocha';
import { expect } from 'chai';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionData } from 'js-yaml-loader!@/*';
import { SharedFunctionsParser } from '@/application/Parser/Script/Compiler/Function/SharedFunctionsParser';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';
import { ParameterDefinitionDataStub } from '@tests/unit/stubs/ParameterDefinitionDataStub';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';
import { FunctionCallDataStub } from '@tests/unit/stubs/FunctionCallDataStub';

describe('SharedFunctionsParser', () => {
    describe('parseFunctions', () => {
        describe('validates functions', () => {
            it('throws if one of the functions is undefined', () => {
                // arrange
                const expectedError = `some functions are undefined`;
                const functions = [ FunctionDataStub.createWithCode(), undefined ];
                const sut = new SharedFunctionsParser();
                // act
                const act = () => sut.parseFunctions(functions);
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
                const sut = new SharedFunctionsParser();
                // act
                const act = () => sut.parseFunctions(functions);
                // assert
                expect(act).to.throw(expectedError);
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
                    const sut = new SharedFunctionsParser();
                    // act
                    const act = () => sut.parseFunctions(functions);
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
                    const sut = new SharedFunctionsParser();
                    // act
                    const act = () => sut.parseFunctions(functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });
            describe('ensures either call or code is defined', () => {
                it('both code and call are defined', () => {
                    // arrange
                    const functionName = 'invalid-function';
                    const expectedError = `both "code" and "call" are defined in "${functionName}"`;
                    const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
                        .withName(functionName)
                        .withCode('code')
                        .withMockCall();
                    const sut = new SharedFunctionsParser();
                    // act
                    const act = () => sut.parseFunctions([ invalidFunction ]);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('neither code and call is defined', () => {
                    // arrange
                    const functionName = 'invalid-function';
                    const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
                    const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
                        .withName(functionName);
                    const sut = new SharedFunctionsParser();
                    // act
                    const act = () => sut.parseFunctions([ invalidFunction ]);
                    // assert
                    expect(act).to.throw(expectedError);
                });
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
                        const sut = new SharedFunctionsParser();
                        // act
                        const act = () => sut.parseFunctions([ func ]);
                        // assert
                        expect(act).to.throw(expectedError);
                    });
                }
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
                const sut = new SharedFunctionsParser();
                const act = () => sut.parseFunctions([ functionData ]);

                // assert
                expect(act).to.throw(expectedError);
            });
        });
        describe('empty functions', () => {
            it('returns empty collection', () => {
                // arrange
                const emptyValues = [ [], undefined ];
                const sut = new SharedFunctionsParser();
                for (const emptyFunctions of emptyValues) {
                    // act
                    const actual = sut.parseFunctions(emptyFunctions);
                    // assert
                    expect(actual).to.not.equal(undefined);
                }
            });
        });
        describe('function with inline code', () => {
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
                const sut = new SharedFunctionsParser();
                // act
                const collection = sut.parseFunctions([ expected ]);
                // expect
                const actual = collection.getFunctionByName(name);
                expectEqualName(expected, actual);
                expectEqualParameters(expected, actual);
                expectEqualFunctionWithInlineCode(expected, actual);
            });
        });
        describe('function with calls', () => {
            it('parses single function with call as expected', () => {
                // arrange
                const call = new FunctionCallDataStub()
                    .withName('calleeFunction')
                    .withParameters({test: 'value'});
                const data = FunctionDataStub.createWithoutCallOrCodes()
                    .withName('caller-function')
                    .withCall(call);
                const sut = new SharedFunctionsParser();
                // act
                const collection = sut.parseFunctions([ data ]);
                // expect
                const actual = collection.getFunctionByName(data.name);
                expectEqualName(data, actual);
                expectEqualParameters(data, actual);
                expectEqualCalls([ call ], actual);
            });
            it('parses multiple functions with call as expected', () => {
                // arrange
                const call1 = new FunctionCallDataStub()
                    .withName('calleeFunction1')
                    .withParameters({ param: 'value' });
                const call2 = new FunctionCallDataStub()
                    .withName('calleeFunction2')
                    .withParameters( {param2: 'value2'});
                const caller1 = FunctionDataStub.createWithoutCallOrCodes()
                    .withName('caller-function')
                    .withCall(call1);
                const caller2 = FunctionDataStub.createWithoutCallOrCodes()
                    .withName('caller-function-2')
                    .withCall([ call1, call2 ]);
                const sut = new SharedFunctionsParser();
                // act
                const collection = sut.parseFunctions([ caller1, caller2 ]);
                // expect
                const compiledCaller1 = collection.getFunctionByName(caller1.name);
                expectEqualName(caller1, compiledCaller1);
                expectEqualParameters(caller1, compiledCaller1);
                expectEqualCalls([ call1 ], compiledCaller1);
                const compiledCaller2 = collection.getFunctionByName(caller2.name);
                expectEqualName(caller2, compiledCaller2);
                expectEqualParameters(caller2, compiledCaller2);
                expectEqualCalls([ call1, call2 ], compiledCaller2);
            });
        });
    });
});

function expectEqualName(
    expected: FunctionDataStub, actual: ISharedFunction): void {
    expect(actual.name).to.equal(expected.name);
}

function expectEqualParameters(
    expected: FunctionDataStub, actual: ISharedFunction): void {
    const actualSimplifiedParameters = actual.parameters.all.map((parameter) => ({
            name: parameter.name,
            optional: parameter.isOptional,
        }));
    const expectedSimplifiedParameters = expected.parameters?.map((parameter) => ({
            name: parameter.name,
            optional: parameter.optional || false,
        })) || [];
    expect(expectedSimplifiedParameters).to.deep.equal(actualSimplifiedParameters, 'Unequal parameters');
}

function expectEqualFunctionWithInlineCode(
    expected: FunctionData, actual: ISharedFunction): void {
    expect(actual.body,
        `function "${actual.name}" has no body`);
    expect(actual.body.code,
        `function "${actual.name}" has no code`);
    expect(actual.body.code.do).to.equal(expected.code);
    expect(actual.body.code.revert).to.equal(expected.revertCode);
}

function expectEqualCalls(
    expected: FunctionCallDataStub[], actual: ISharedFunction) {
    expect(actual.body,
        `function "${actual.name}" has no body`);
    expect(actual.body.calls,
        `function "${actual.name}" has no calls`);
    const actualSimplifiedCalls = actual.body.calls
        .map((call) => ({
            function: call.functionName,
            params: call.args.getAllParameterNames().map((name) => ({
                name, value: call.args.getArgument(name).argumentValue,
            })),
        }));
    const expectedSimplifiedCalls = expected
        .map((call) => ({
            function: call.function,
            params: Object.keys(call.parameters).map((key) => (
                { name: key, value: call.parameters[key] }
            )),
        }));
    expect(actualSimplifiedCalls).to.deep.equal(expectedSimplifiedCalls, 'Unequal calls');
}
