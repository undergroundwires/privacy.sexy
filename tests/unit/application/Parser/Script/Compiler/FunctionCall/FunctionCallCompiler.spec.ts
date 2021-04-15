import 'mocha';
import { expect } from 'chai';
import { FunctionCallData, FunctionCallParametersData } from 'js-yaml-loader!@/*';
import { FunctionCallCompiler } from '@/application/Parser/Script/Compiler/FunctionCall/FunctionCallCompiler';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ExpressionsCompilerStub } from '@tests/unit/stubs/ExpressionsCompilerStub';
import { SharedFunctionCollectionStub } from '@tests/unit/stubs/SharedFunctionCollectionStub';
import { SharedFunctionStub } from '@tests/unit/stubs/SharedFunctionStub';

describe('FunctionCallCompiler', () => {
    describe('compileCall', () => {
        describe('parameter validation', () => {
            describe('call', () => {
                it('throws with undefined call', () => {
                    // arrange
                    const expectedError = 'undefined call';
                    const call = undefined;
                    const functions = new SharedFunctionCollectionStub();
                    const sut = new MockableFunctionCallCompiler();
                    // act
                    const act = () => sut.compileCall(call, functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if call is not an object', () => {
                    // arrange
                    const expectedError = 'called function(s) must be an object';
                    const invalidCalls: readonly any[] = ['string', 33];
                    const sut = new MockableFunctionCallCompiler();
                    const functions = new SharedFunctionCollectionStub();
                    invalidCalls.forEach((invalidCall) => {
                        // act
                        const act = () => sut.compileCall(invalidCall, functions);
                        // assert
                        expect(act).to.throw(expectedError);
                    });
                });
                it('throws if call sequence has undefined call', () => {
                    // arrange
                    const expectedError = 'undefined function call';
                    const call: FunctionCallData[] = [
                        { function: 'function-name' },
                        undefined,
                    ];
                    const functions = new SharedFunctionCollectionStub();
                    const sut = new MockableFunctionCallCompiler();
                    // act
                    const act = () => sut.compileCall(call, functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if call sequence has undefined function name', () => {
                    // arrange
                    const expectedError = 'empty function name called';
                    const call: FunctionCallData[] = [
                        { function: 'function-name' },
                        { function: undefined },
                    ];
                    const functions = new SharedFunctionCollectionStub();
                    const sut = new MockableFunctionCallCompiler();
                    // act
                    const act = () => sut.compileCall(call, functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if call parameters does not match function parameters', () => {
                    // arrange
                    const functionName = 'test-function-name';
                    const testCases = [
                        {
                            name: 'an unexpected parameter instead',
                            functionParameters: [ 'another-parameter' ],
                            callParameters: [ 'unexpected-parameter' ],
                            expectedError: `function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`,
                        },
                        {
                            name: 'an unexpected parameter when none required',
                            functionParameters: undefined,
                            callParameters: [ 'unexpected-parameter' ],
                            expectedError: `function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`,
                        },
                        {
                            name: 'expected and unexpected parameter',
                            functionParameters: [ 'expected-parameter' ],
                            callParameters: [ 'expected-parameter', 'unexpected-parameter' ],
                            expectedError: `function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter"`,
                        },
                    ];
                    for (const testCase of testCases) {
                        it(testCase.name, () => {
                            const func = new SharedFunctionStub()
                                .withName('test-function-name')
                                .withParameters(...testCase.functionParameters);
                            let params: FunctionCallParametersData = {};
                            for (const parameter of testCase.callParameters) {
                                params = {...params, [parameter]: 'defined-parameter-value '};
                            }
                            const call: FunctionCallData = { function: func.name, parameters: params };
                            const functions = new SharedFunctionCollectionStub().withFunction(func);
                            const sut = new MockableFunctionCallCompiler();
                            // act
                            const act = () => sut.compileCall(call, functions);
                            // assert
                            expect(act).to.throw(testCase.expectedError);
                        });
                    }
                });
            });
            describe('functions', () => {
                it('throws with undefined functions', () => {
                    // arrange
                    const expectedError = 'undefined functions';
                    const call: FunctionCallData = { function: 'function-call' };
                    const functions = undefined;
                    const sut = new MockableFunctionCallCompiler();
                    // act
                    const act = () => sut.compileCall(call, functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if function does not exist', () => {
                    // arrange
                    const expectedError = 'function does not exist';
                    const call: FunctionCallData = { function: 'function-call' };
                    const functions: ISharedFunctionCollection = {
                        getFunctionByName: () => { throw new Error(expectedError); },
                    };
                    const sut = new MockableFunctionCallCompiler();
                    // act
                    const act = () => sut.compileCall(call, functions);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });


        });
        describe('builds code as expected', () => {
            describe('builds single call as expected', () => {
                // arrange
                const parametersTestCases = [
                    {
                        name: 'undefined parameters',
                        parameters: undefined,
                        parameterValues: undefined,
                    },
                    {
                        name: 'empty parameters',
                        parameters: [],
                        parameterValues: { },
                    },
                    {
                        name: 'non-empty parameters',
                        parameters: [ 'param1', 'param2' ],
                        parameterValues: { param1: 'value1', param2: 'value2' },
                    },
                ];
                for (const testCase of parametersTestCases) {
                    it(testCase.name, () => {
                        const expectedExecute = `expected-execute`;
                        const expectedRevert = `expected-revert`;
                        const func = new SharedFunctionStub().withParameters(...testCase.parameters);
                        const functions = new SharedFunctionCollectionStub().withFunction(func);
                        const call: FunctionCallData = { function: func.name, parameters: testCase.parameterValues };
                        const expressionsCompilerMock = new ExpressionsCompilerStub()
                            .setup(func.code, testCase.parameterValues, expectedExecute)
                            .setup(func.revertCode, testCase.parameterValues, expectedRevert);
                        const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
                        // act
                        const actual = sut.compileCall(call, functions);
                        // assert
                        expect(actual.code).to.equal(expectedExecute);
                        expect(actual.revertCode).to.equal(expectedRevert);
                    });
                }
            });
            it('builds call sequence as expected', () => {
                // arrange
                const firstFunction = new SharedFunctionStub()
                    .withName('first-function-name')
                    .withCode('first-function-code')
                    .withRevertCode('first-function-revert-code');
                const secondFunction = new SharedFunctionStub()
                    .withName('second-function-name')
                    .withParameters('testParameter')
                    .withCode('second-function-code')
                    .withRevertCode('second-function-revert-code');
                const secondCallArguments = { testParameter: 'testValue' };
                const call: FunctionCallData[] = [
                    { function: firstFunction.name },
                    { function: secondFunction.name, parameters: secondCallArguments },
                ];
                const expressionsCompilerMock = new ExpressionsCompilerStub()
                    .setup(firstFunction.code, {}, firstFunction.code)
                    .setup(firstFunction.revertCode, {}, firstFunction.revertCode)
                    .setup(secondFunction.code, secondCallArguments, secondFunction.code)
                    .setup(secondFunction.revertCode, secondCallArguments, secondFunction.revertCode);
                const expectedExecute = `${firstFunction.code}\n${secondFunction.code}`;
                const expectedRevert = `${firstFunction.revertCode}\n${secondFunction.revertCode}`;
                const functions = new SharedFunctionCollectionStub()
                    .withFunction(firstFunction)
                    .withFunction(secondFunction);
                const sut = new MockableFunctionCallCompiler(expressionsCompilerMock);
                // act
                const actual = sut.compileCall(call, functions);
                // assert
                expect(actual.code).to.equal(expectedExecute);
                expect(actual.revertCode).to.equal(expectedRevert);
            });
        });
    });
});

class MockableFunctionCallCompiler extends FunctionCallCompiler {
    constructor(expressionsCompiler: IExpressionsCompiler = new ExpressionsCompilerStub()) {
        super(expressionsCompiler);
    }
}
