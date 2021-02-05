import 'mocha';
import { expect } from 'chai';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import { FunctionData, ScriptData, FunctionCallData, ScriptFunctionCallData, FunctionCallParametersData } from 'js-yaml-loader!@/*';
import { IScriptCode } from '@/domain/IScriptCode';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptCompiler } from '@/application/Parser/Script/Compiler/IScriptCompiler';
import { LanguageSyntaxStub } from '../../../../stubs/LanguageSyntaxStub';
import { ScriptDataStub } from '../../../../stubs/ScriptDataStub';
import { FunctionDataStub } from '../../../../stubs/FunctionDataStub';

describe('ScriptCompiler', () => {
    describe('ctor', () => {
        it('throws if syntax is undefined', () => {
            // arrange
            const expectedError = `undefined syntax`;
            // act
            const act = () => new ScriptCompilerBuilder()
                .withSomeFunctions()
                .withSyntax(undefined)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws if one of the functions is undefined', () => {
            // arrange
            const expectedError = `some functions are undefined`;
            const functions = [ new FunctionDataStub(), undefined ];
            // act
            const act = () => new ScriptCompilerBuilder()
                .withFunctions(...functions)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when functions have same names', () => {
            // arrange
            const name = 'same-func-name';
            const expectedError = `duplicate function name: "${name}"`;
            const functions = [
                new FunctionDataStub().withName(name),
                new FunctionDataStub().withName(name),
            ];
            // act
            const act = () => new ScriptCompilerBuilder()
                .withFunctions(...functions)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
        it('throws when function parameters have same names', () => {
            // arrange
            const parameterName = 'duplicate-parameter';
            const func = new FunctionDataStub()
                .withParameters(parameterName, parameterName);
            const expectedError = `"${func.name}": duplicate parameter name: "${parameterName}"`;
            // act
            const act = () => new ScriptCompilerBuilder()
                .withFunctions(func)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
        describe('throws when when function have duplicate code', () => {
            it('code', () => {
                // arrange
                const code = 'duplicate-code';
                const expectedError = `duplicate "code" in functions: "${code}"`;
                const functions = [
                    new FunctionDataStub().withName('func-1').withCode(code),
                    new FunctionDataStub().withName('func-2').withCode(code),
                ];
                // act
                const act = () => new ScriptCompilerBuilder()
                    .withFunctions(...functions)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            });
            it('revertCode', () => {
                // arrange
                const revertCode = 'duplicate-revert-code';
                const expectedError = `duplicate "revertCode" in functions: "${revertCode}"`;
                const functions = [
                    new FunctionDataStub().withName('func-1').withCode('code-1').withRevertCode(revertCode),
                    new FunctionDataStub().withName('func-2').withCode('code-2').withRevertCode(revertCode),
                ];
                // act
                const act = () => new ScriptCompilerBuilder()
                    .withFunctions(...functions)
                    .build();
                // assert
                expect(act).to.throw(expectedError);
            });
        });
        it('can construct with empty functions', () => {
            // arrange
            const builder = new ScriptCompilerBuilder()
                .withEmptyFunctions();
            // act
            const act = () => builder.build();
            // assert
            expect(act).to.not.throw();
        });
    });
    describe('canCompile', () => {
        it('returns true if "call" is defined', () => {
            // arrange
            const sut = new ScriptCompilerBuilder()
                .withEmptyFunctions()
                .build();
            const script = ScriptDataStub.createWithCall();
            // act
            const actual = sut.canCompile(script);
            // assert
            expect(actual).to.equal(true);
        });
        it('returns false if "call" is undefined', () => {
            // arrange
            const sut = new ScriptCompilerBuilder()
                .withEmptyFunctions()
                .build();
            const script = ScriptDataStub.createWithCode();
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
                const sut = new ScriptCompilerBuilder()
                    .withEmptyFunctions()
                    .build();
                const script = ScriptDataStub.createWithCall();
                // act
                const act = () => sut.compile(script);
                // assert
                expect(act).to.throw(expectedError);
            });
            it('throws if call is not an object', () => {
                // arrange
                const expectedError = 'called function(s) must be an object';
                const invalidValues = [undefined, 'string', 33];
                const sut = new ScriptCompilerBuilder()
                    .withSomeFunctions()
                    .build();
                invalidValues.forEach((invalidValue) => {
                    const script = ScriptDataStub.createWithoutCallOrCodes() // because call ctor overwrites "undefined"
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
                    const sut = new ScriptCompilerBuilder()
                        .withSomeFunctions()
                        .build();
                    const nonExistingFunctionName = 'non-existing-func';
                    const expectedError = `called function is not defined "${nonExistingFunctionName}"`;
                    const call: ScriptFunctionCallData = { function: nonExistingFunctionName };
                    const script = ScriptDataStub.createWithCall(call);
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if function is undefined', () => {
                    // arrange
                    const existingFunctionName = 'existing-func';
                    const sut = new ScriptCompilerBuilder()
                        .withFunctionNames(existingFunctionName)
                        .build();
                    const call: ScriptFunctionCallData = [
                        { function: existingFunctionName },
                        undefined,
                    ];
                    const script = ScriptDataStub.createWithCall(call);
                    const expectedError = `undefined function call in script "${script.name}"`;
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
                it('throws if function name is not given', () => {
                    // arrange
                    const existingFunctionName = 'existing-func';
                    const sut = new ScriptCompilerBuilder()
                        .withFunctionNames(existingFunctionName)
                        .build();
                    const call: FunctionCallData[] = [
                        { function: existingFunctionName },
                        { function: undefined }];
                    const script = ScriptDataStub.createWithCall(call);
                    const expectedError = `empty function name called in script "${script.name}"`;
                    // act
                    const act = () => sut.compile(script);
                    // assert
                    expect(act).to.throw(expectedError);
                });
            });
            it('throws if provided parameters does not match given ones', () => {
                // arrange
                const unexpectedParameterName = 'unexpected-parameter-name';
                const functionName = 'test-function-name';
                const expectedError = `function "${functionName}" has unexpected parameter(s) provided: "${unexpectedParameterName}"`;
                const sut = new ScriptCompilerBuilder()
                    .withFunctions(
                        new FunctionDataStub()
                            .withName(functionName)
                            .withParameters('another-parameter'))
                    .build();
                const params: FunctionCallParametersData = {};
                params[unexpectedParameterName] = 'unexpected-parameter-value';
                const call: ScriptFunctionCallData = { function: functionName, parameters: params };
                const script = ScriptDataStub.createWithCall(call);
                // act
                const act = () => sut.compile(script);
                // assert
                expect(act).to.throw(expectedError);
            });
        });
        describe('builds code as expected', () => {
            it('creates code with expected syntax', () => { // test through script validation logic
                // act
                const commentDelimiter = 'should not throw';
                const syntax = new LanguageSyntaxStub().withCommentDelimiters(commentDelimiter);
                const func = new FunctionDataStub()
                    .withCode(`${commentDelimiter} duplicate-line\n${commentDelimiter} duplicate-line`);
                const sut = new ScriptCompilerBuilder()
                    .withFunctions(func)
                    .withSyntax(syntax)
                    .build();
                const call: FunctionCallData = { function: func.name };
                const script = ScriptDataStub.createWithCall(call);
                // act
                const act = () => sut.compile(script);
                // assert
                expect(act).to.not.throw();
            });
            it('builds single call as expected', () => {
                // arrange
                const functionName = 'testSharedFunction';
                const expectedExecute = `expected-execute`;
                const expectedRevert = `expected-revert`;
                const func = new FunctionDataStub()
                    .withName(functionName)
                    .withCode(expectedExecute)
                    .withRevertCode(expectedRevert);
                const sut = new ScriptCompilerBuilder()
                    .withFunctions(func)
                    .build();
                const call: FunctionCallData = { function: functionName };
                const script = ScriptDataStub.createWithCall(call);
                // act
                const actual = sut.compile(script);
                // assert
                expect(actual.execute).to.equal(expectedExecute);
                expect(actual.revert).to.equal(expectedRevert);
            });
            it('builds call sequence as expected', () => {
                // arrange
                const firstFunction = new FunctionDataStub()
                    .withName('first-function-name')
                    .withCode('first-function-code')
                    .withRevertCode('first-function-revert-code');
                const secondFunction = new FunctionDataStub()
                    .withName('second-function-name')
                    .withCode('second-function-code')
                    .withRevertCode('second-function-revert-code');
                const expectedExecute = `${firstFunction.code}\n${secondFunction.code}`;
                const expectedRevert = `${firstFunction.revertCode}\n${secondFunction.revertCode}`;
                const sut = new ScriptCompilerBuilder()
                    .withFunctions(firstFunction, secondFunction)
                    .build();
                const call: FunctionCallData[] = [
                    { function: firstFunction.name },
                    { function: secondFunction.name },
                ];
                const script = ScriptDataStub.createWithCall(call);
                // act
                const actual = sut.compile(script);
                // assert
                expect(actual.execute).to.equal(expectedExecute);
                expect(actual.revert).to.equal(expectedRevert);
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
            it('throws when parameters are undefined', () => {
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
        interface ITestCase {
            code: string;
            parameters?: FunctionCallParametersData;
        }
        class TestEnvironment {
            public readonly sut: IScriptCompiler;
            public readonly script: ScriptData;
            constructor(testCase: ITestCase) {
                const functionName = 'testFunction';
                const parameters = testCase.parameters ? Object.keys(testCase.parameters) : [];
                const func = new FunctionDataStub()
                    .withName(functionName)
                    .withParameters(...parameters)
                    .withCode(this.getCode(testCase.code, 'execute'))
                    .withRevertCode(this.getCode(testCase.code, 'revert'));
                const syntax = new LanguageSyntaxStub();
                this.sut = new ScriptCompiler([func], syntax);
                const call: FunctionCallData = {
                    function: functionName,
                    parameters: testCase.parameters,
                };
                this.script = ScriptDataStub.createWithCall(call);
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
    });
});


// tslint:disable-next-line:max-classes-per-file
class ScriptCompilerBuilder {
    private static createFunctions(...names: string[]): FunctionData[] {
        return names.map((functionName) => {
            return new FunctionDataStub().withName(functionName);
        });
    }
    private functions: FunctionData[];
    private syntax: ILanguageSyntax = new LanguageSyntaxStub();
    public withFunctions(...functions: FunctionData[]): ScriptCompilerBuilder {
        this.functions = functions;
        return this;
    }
    public withSomeFunctions(): ScriptCompilerBuilder {
        this.functions = ScriptCompilerBuilder.createFunctions('test-function');
        return this;
    }
    public withFunctionNames(...functionNames: string[]): ScriptCompilerBuilder {
        this.functions = ScriptCompilerBuilder.createFunctions(...functionNames);
        return this;
    }
    public withEmptyFunctions(): ScriptCompilerBuilder {
        this.functions = [];
        return this;
    }
    public withSyntax(syntax: ILanguageSyntax): ScriptCompilerBuilder {
        this.syntax = syntax;
        return this;
    }
    public build(): ScriptCompiler {
        if (!this.functions) {
            throw new Error('Function behavior not defined');
        }
        return new ScriptCompiler(this.functions, this.syntax);
    }
}
