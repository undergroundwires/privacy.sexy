import 'mocha';
import { expect } from 'chai';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import { FunctionData } from 'js-yaml-loader!@/*';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IFunctionCompiler } from '@/application/Parser/Script/Compiler/Function/IFunctionCompiler';
import { IFunctionCallCompiler } from '@/application/Parser/Script/Compiler/FunctionCall/IFunctionCallCompiler';
import { ICompiledCode } from '@/application/Parser/Script/Compiler/FunctionCall/ICompiledCode';
import { LanguageSyntaxStub } from '@tests/unit/stubs/LanguageSyntaxStub';
import { ScriptDataStub } from '@tests/unit/stubs/ScriptDataStub';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';
import { FunctionCallCompilerStub } from '@tests/unit/stubs/FunctionCallCompilerStub';
import { FunctionCompilerStub } from '@tests/unit/stubs/FunctionCompilerStub';
import { SharedFunctionCollectionStub } from '@tests/unit/stubs/SharedFunctionCollectionStub';

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
    });
    describe('canCompile', () => {
        it('throws if script is undefined', () => {
            // arrange
            const expectedError = 'undefined script';
            const argument = undefined;
            const builder = new ScriptCompilerBuilder()
                .withEmptyFunctions()
                .build();
            // act
            const act = () => builder.canCompile(argument);
            // assert
            expect(act).to.throw(expectedError);
        });
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
        it('throws if script is undefined', () => {
            // arrange
            const expectedError = 'undefined script';
            const argument = undefined;
            const builder = new ScriptCompilerBuilder()
                .withEmptyFunctions()
                .build();
            // act
            const act = () => builder.compile(argument);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('returns code as expected', () => {
            // arrange
            const expected: ICompiledCode = {
                code: 'expected-code',
                revertCode: 'expected-revert-code',
            };
            const script = ScriptDataStub.createWithCall();
            const functions = [ FunctionDataStub.createWithCode().withName('existing-func') ];
            const compiledFunctions = new SharedFunctionCollectionStub();
            const compilerMock = new FunctionCompilerStub();
            compilerMock.setup(functions, compiledFunctions);
            const callCompilerMock = new FunctionCallCompilerStub();
            callCompilerMock.setup(script.call, compiledFunctions, expected);
            const sut = new ScriptCompilerBuilder()
                .withFunctions(...functions)
                .withFunctionCompiler(compilerMock)
                .withFunctionCallCompiler(callCompilerMock)
                .build();
            // act
            const code = sut.compile(script);
            // assert
            expect(code.execute).to.equal(expected.code);
            expect(code.revert).to.equal(expected.revertCode);
        });
        it('creates with expected syntax', () => {
            // arrange
            let isUsed = false;
            const syntax: ILanguageSyntax = {
                get commentDelimiters() {
                    isUsed = true;
                    return [];
                },
                get commonCodeParts() {
                    isUsed = true;
                    return [];
                },
            };
            const sut = new ScriptCompilerBuilder()
                .withSomeFunctions()
                .withSyntax(syntax)
                .build();
            const scriptData = ScriptDataStub.createWithCall();
            // act
            sut.compile(scriptData);
            // assert
            expect(isUsed).to.equal(true);
        });
        it('rethrows error with script name', () => {
            // arrange
            const scriptName = 'scriptName';
            const innerError = 'innerError';
            const expectedError = `Script "${scriptName}" ${innerError}`;
            const callCompiler: IFunctionCallCompiler = {
                compileCall: () => { throw new Error(innerError); },
            };
            const scriptData = ScriptDataStub.createWithCall()
                .withName(scriptName);
            const sut = new ScriptCompilerBuilder()
                .withSomeFunctions()
                .withFunctionCallCompiler(callCompiler)
                .build();
            // act
            const act = () => sut.compile(scriptData);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('rethrows error from ScriptCode with script name', () => {
            // arrange
            const scriptName = 'scriptName';
            const expectedError = `Script "${scriptName}" code is empty or undefined`;
            const callCompiler: IFunctionCallCompiler = {
                compileCall: () => ({ code: undefined, revertCode: undefined }),
            };
            const scriptData = ScriptDataStub.createWithCall()
                .withName(scriptName);
            const sut = new ScriptCompilerBuilder()
                .withSomeFunctions()
                .withFunctionCallCompiler(callCompiler)
                .build();
            // act
            const act = () => sut.compile(scriptData);
            // assert
            expect(act).to.throw(expectedError);
        });
    });
});

class ScriptCompilerBuilder {
    private static createFunctions(...names: string[]): FunctionData[] {
        return names.map((functionName) => {
            return FunctionDataStub.createWithCode().withName(functionName);
        });
    }
    private functions: FunctionData[];
    private syntax: ILanguageSyntax = new LanguageSyntaxStub();
    private functionCompiler: IFunctionCompiler = new FunctionCompilerStub();
    private callCompiler: IFunctionCallCompiler = new FunctionCallCompilerStub();
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
    public withFunctionCompiler(functionCompiler: IFunctionCompiler): ScriptCompilerBuilder {
        this.functionCompiler = functionCompiler;
        return this;
    }
    public withFunctionCallCompiler(callCompiler: IFunctionCallCompiler): ScriptCompilerBuilder {
        this.callCompiler = callCompiler;
        return this;
    }
    public build(): ScriptCompiler {
        if (!this.functions) {
            throw new Error('Function behavior not defined');
        }
        return new ScriptCompiler(this.functions, this.syntax, this.functionCompiler, this.callCompiler);
    }
}
