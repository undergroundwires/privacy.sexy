import 'mocha';
import { expect } from 'chai';
import { ScriptCompiler } from '@/application/Parser/Compiler/ScriptCompiler';
import { YamlScriptStub } from '../../../stubs/YamlScriptStub';
import { YamlFunction, YamlScript, FunctionCall, ScriptFunctionCall, FunctionCallParameters } from 'js-yaml-loader!@/application.yaml';
import { IScriptCode } from '@/domain/IScriptCode';
import { IScriptCompiler } from '@/application/Parser/Compiler/IScriptCompiler';

describe('ScriptCompiler', () => {
    describe('ctor', () => {
        it('throws when functions have same names', () => {
            // arrange
            const expectedError = `duplicate function name: "same-func-name"`;
            const functions: YamlFunction[] = [ {
                name: 'same-func-name',
                code: 'non-empty-code',
            }, {
                name: 'same-func-name',
                code: 'non-empty-code-2',
            }];
            // act
            const act = () => new ScriptCompiler(functions);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when function parameters have same names', () => {
            // arrange
            const func: YamlFunction = {
                name: 'function-name',
                code: 'non-empty-code',
                parameters: [ 'duplicate', 'duplicate' ],
            };
            const expectedError = `"${func.name}": duplicate parameter name: "duplicate"`;
            // act
            const act = () => new ScriptCompiler([func]);
            // assert
            expect(act).to.throw(expectedError);
        });
        describe('throws when when function have duplicate code', () => {
            it('code', () => {
                // arrange
                const expectedError = `duplicate "code" in functions: "duplicate-code"`;
                const functions: YamlFunction[] = [ {
                    name: 'func-1',
                    code: 'duplicate-code',
                }, {
                    name: 'func-2',
                    code: 'duplicate-code',
                }];
                // act
                const act = () => new ScriptCompiler(functions);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('revertCode', () => {
                // arrange
                const expectedError = `duplicate "revertCode" in functions: "duplicate-revert-code"`;
                const functions: YamlFunction[] = [ {
                    name: 'func-1',
                    code: 'code-1',
                    revertCode: 'duplicate-revert-code',
                }, {
                    name: 'func-2',
                    code: 'code-2',
                    revertCode: 'duplicate-revert-code',
                }];
                // act
                const act = () => new ScriptCompiler(functions);
                // assert
                expect(act).to.throw(expectedError);
            });
        });
    });
    describe('canCompile', () => {
        it('returns true if "call" is defined', () => {
            // arrange
            const sut = new ScriptCompiler([]);
            const script = YamlScriptStub.createWithCall();
            // act
            const actual = sut.canCompile(script);
            // assert
            expect(actual).to.equal(true);
        });
        it('returns false if "call" is undefined', () => {
            // arrange
            const sut = new ScriptCompiler([]);
            const script = YamlScriptStub.createWithCode();
            // act
            const actual = sut.canCompile(script);
            // assert
            expect(actual).to.equal(false);
        });
    });
    describe('compile', () => {
        describe('invalid state', () => {
            it('throws if functions are empty', () => {
                // arrange
                const expectedError = 'cannot compile without shared functions';
                const functions = [];
                const sut = new ScriptCompiler(functions);
                const script = YamlScriptStub.createWithCall();
                // act
                const act = () => sut.compile(script);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws if call is not an object', () => {
                // arrange
                const expectedError = 'called function(s) must be an object';
                const invalidValues = [undefined, 'string', 33];
                const sut = new ScriptCompiler(createFunctions());
                invalidValues.forEach((invalidValue) => {
                    const script = YamlScriptStub.createWithoutCallOrCodes() // because call ctor overwrites "undefined"
                        .withCall(invalidValue as any);
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });
            describe('invalid function reference', () => {
                it('throws if function does not exist', () => {
                    // arrange
                    const sut = new ScriptCompiler(createFunctions());
                    const nonExistingFunctionName = 'non-existing-func';
                    const expectedError = `called function is not defined "${nonExistingFunctionName}"`;
                    const call: ScriptFunctionCall = { function: nonExistingFunctionName };
                    const script = YamlScriptStub.createWithCall(call);
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if function is undefined', () => {
                    // arrange
                    const existingFunctionName = 'existing-func';
                    const sut = new ScriptCompiler(createFunctions(existingFunctionName));
                    const call: ScriptFunctionCall = [
                        { function: existingFunctionName },
                        undefined,
                    ];
                    const script = YamlScriptStub.createWithCall(call);
                    const expectedError = `undefined function call in script "${script.name}"`;
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if function name is not given', () => {
                    // arrange
                    const existingFunctionName = 'existing-func';
                    const sut = new ScriptCompiler(createFunctions(existingFunctionName));
                    const call: FunctionCall[] = [
                        { function: existingFunctionName },
                        { function: undefined }];
                    const script = YamlScriptStub.createWithCall(call);
                    const expectedError = `empty function name called in script "${script.name}"`;
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });
        });
        describe('builds code as expected', () => {
            it('builds single call as expected', () => {
                // arrange
                const functionName = 'testSharedFunction';
                const expected: IScriptCode = {
                    execute: 'expected-code',
                    revert: 'expected-revert-code',
                };
                const func: YamlFunction = {
                    name: functionName,
                    parameters: [],
                    code: expected.execute,
                    revertCode: expected.revert,
                };
                const sut = new ScriptCompiler([func]);
                const call: FunctionCall = { function: functionName };
                const script = YamlScriptStub.createWithCall(call);
                // act
                const actual = sut.compile(script);
                // assert
                expect(actual).to.deep.equal(expected);
            });
            it('builds call sequence as expected', () => {
                // arrange
                const firstFunction: YamlFunction = {
                    name: 'first-function-name',
                    parameters: [],
                    code: 'first-function-code',
                    revertCode: 'first-function-revert-code',
                };
                const secondFunction: YamlFunction = {
                    name: 'second-function-name',
                    parameters: [],
                    code: 'second-function-code',
                    revertCode: 'second-function-revert-code',
                };
                const expected: IScriptCode = {
                    execute: 'first-function-code\nsecond-function-code',
                    revert: 'first-function-revert-code\nsecond-function-revert-code',
                };
                const sut = new ScriptCompiler([firstFunction, secondFunction]);
                const call: FunctionCall[] = [
                    { function: firstFunction.name },
                    { function: secondFunction.name },
                ];
                const script = YamlScriptStub.createWithCall(call);
                // act
                const actual = sut.compile(script);
                // assert
                expect(actual).to.deep.equal(expected);
            });
        });
        describe('parameter substitution', () => {
            describe('substitutes as expected', () => {
                it('with different parameters', () => {
                    // arrange
                    const env = new TestEnvironment({
                        code: 'He{{ $firstParameter }} {{ $secondParameter }}!',
                        parameters: {
                            firstParameter: 'llo',
                            secondParameter: 'world',
                        },
                    });
                    const expected = env.expect('Hello world!');
                    // act
                    const actual = env.sut.compile(env.script);
                    // assert
                    expect(actual).to.deep.equal(expected);
                });
                it('with single parameter', () => {
                    // arrange
                    const env = new TestEnvironment({
                        code: '{{ $parameter }}!',
                        parameters: {
                            parameter: 'Hodor',
                        },
                    });
                    const expected = env.expect('Hodor!');
                    // act
                    const actual = env.sut.compile(env.script);
                    // assert
                    expect(actual).to.deep.equal(expected);
                });
            });
            it('throws when parameters is undefined', () => {
                // arrange
                const env = new TestEnvironment({
                    code: '{{ $parameter }} {{ $parameter }}!',
                });
                const expectedError = 'no parameters defined, expected: "parameter"';
                // act
                const act = () => env.sut.compile(env.script);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws when parameter value is not provided', () => {
                // arrange
                const env = new TestEnvironment({
                    code: '{{ $parameter }} {{ $parameter }}!',
                    parameters: {
                        parameter: undefined,
                    },
                });
                const expectedError = 'parameter value is not provided for "parameter" in function call';
                // act
                const act = () => env.sut.compile(env.script);
                // assert
                expect(act).to.throw(expectedError);
            });
        });
    });
});

interface ITestCase {
    code: string;
    parameters?: FunctionCallParameters;
}

class TestEnvironment {
    public readonly sut: IScriptCompiler;
    public readonly script: YamlScript;
    constructor(testCase: ITestCase) {
        const functionName = 'testFunction';
        const func: YamlFunction = {
            name: functionName,
            parameters: testCase.parameters ? Object.keys(testCase.parameters) : undefined,
            code: this.getCode(testCase.code, 'execute'),
            revertCode: this.getCode(testCase.code, 'revert'),
        };
        this.sut = new ScriptCompiler([func]);
        const call: FunctionCall = {
            function: functionName,
            parameters: testCase.parameters,
        };
        this.script = YamlScriptStub.createWithCall(call);
    }
    public expect(code: string): IScriptCode {
        return {
            execute: this.getCode(code, 'execute'),
            revert: this.getCode(code, 'revert'),
        };
    }
    private getCode(text: string, type: 'execute' | 'revert'): string {
        return `${text} (${type})`;
    }
}

function createFunctions(...names: string[]): YamlFunction[] {
    if (!names || names.length === 0) {
        names = ['test-function'];
    }
    return names.map((functionName) => {
        const func: YamlFunction = {
            name: functionName,
            parameters: [],
            code: `REM test-code (${functionName})`,
            revertCode: `REM test-revert-code (${functionName})`,
        };
        return func;
    });
}
