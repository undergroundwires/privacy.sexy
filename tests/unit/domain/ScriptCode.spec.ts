import 'mocha';
import { expect } from 'chai';
import { ScriptCode } from '@/domain/ScriptCode';
import { IScriptCode } from '@/domain/IScriptCode';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { LanguageSyntaxStub } from '../stubs/LanguageSyntaxStub';

describe('ScriptCode', () => {
    describe('scriptName', () => {
        it('throws if undefined', () => {
            // arrange
            const expectedError = 'name is undefined';
            const name = undefined;
            // act
            const act = () => new ScriptCodeBuilder()
                .withName(name)
                .build();
            // assert
            expect(act).to.throw(expectedError);
        });
    });
    describe('code', () => {
        describe('throws with invalid code', () => {
            // arrange
            const scriptName = 'test-script';
            const testCases = [
                {
                    name: 'throws when "execute" and "revert" are same',
                    code: {
                        execute: 'same',
                        revert: 'same',
                    },
                    expectedError: `${scriptName} (revert): Code itself and its reverting code cannot be the same`,
                },
                {
                    name: 'cannot construct with undefined "execute"',
                    code: {
                        execute: undefined,
                        revert: 'code',
                    },
                    expectedError: `code of ${scriptName} is empty or undefined`,
                },
                {
                    name: 'cannot construct with empty "execute"',
                    code: {
                        execute: '',
                        revert: 'code',
                    },
                    expectedError: `code of ${scriptName} is empty or undefined`,
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    // act
                    const act = () => new ScriptCodeBuilder()
                        .withName(scriptName)
                        .withExecute( testCase.code.execute)
                        .withRevert(testCase.code.revert)
                        .build();
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
        describe('throws with invalid code in both "execute" or "revert"', () => {
            // arrange
            const scriptName = 'script-name';
            const testCases = [
                {
                    testName: 'cannot construct with duplicate lines',
                    code: 'duplicate\nduplicate\ntest\nduplicate',
                    expectedMessage: 'Duplicates detected in script "$scriptName":\n duplicate\nduplicate',
                },
                {
                    testName: 'cannot construct with empty lines',
                    code: 'line1\n\n\nline2',
                    expectedMessage: 'script has empty lines "$scriptName"',
                },
            ];
            // act
            const actions = [];
            for (const testCase of testCases) {
                const substituteScriptName = (name: string) => testCase.expectedMessage.replace('$scriptName', name);
                actions.push(...[
                    {
                        act: () => new ScriptCodeBuilder()
                            .withName(scriptName)
                            .withExecute(testCase.code)
                            .build(),
                        testName: `execute: ${testCase.testName}`,
                        expectedMessage: substituteScriptName(scriptName),
                    },
                    {
                        act: () => new ScriptCodeBuilder()
                            .withName(scriptName)
                            .withRevert(testCase.code)
                            .build(),
                        testName: `revert: ${testCase.testName}`,
                        expectedMessage: substituteScriptName(`${scriptName} (revert)`),
                    },
                ]);
            }
            // assert
            for (const action of actions) {
                it(action.testName, () => {
                    expect(action.act).to.throw(action.expectedMessage,
                        `Code used: ${action.code}`);
                });
            }
        });
        describe('sets as expected with valid "execute" or "revert"', () => {
            // arrange
            const syntax = new LanguageSyntaxStub()
                .withCommonCodeParts(')', 'else', '(')
                .withCommentDelimiters('#', '//');
            const testCases = [
                {
                    testName: 'code is a valid string',
                    code: 'valid code',
                },
                {
                    testName: 'code consists of common code parts',
                    code: syntax.commonCodeParts.join(' '),
                },
                {
                    testName: 'code is a common code part',
                    code: syntax.commonCodeParts[0],
                },
                {
                    testName: `code with duplicated comment lines (${syntax.commentDelimiters[0]})`,
                    code: `${syntax.commentDelimiters[0]} comment\n${syntax.commentDelimiters[0]} comment`,
                },
                {
                    testName: `code with duplicated comment lines (${syntax.commentDelimiters[1]})`,
                    code: `${syntax.commentDelimiters[1]} comment\n${syntax.commentDelimiters[1]} comment`,
                },
            ];
            // act
            const actions = [];
            for (const testCase of testCases) {
                actions.push(...[
                    {
                        testName: `execute: ${testCase.testName}`,
                        act: () =>
                            new ScriptCodeBuilder()
                                .withSyntax(syntax)
                                .withExecute(testCase.code)
                                .build(),
                        expect: (sut: IScriptCode) => sut.execute === testCase.code,
                    },
                    {
                        testName: `revert: ${testCase.testName}`,
                        act: () =>
                            new ScriptCodeBuilder()
                                .withSyntax(syntax)
                                .withRevert(testCase.code)
                                .build(),
                        expect: (sut: IScriptCode) => sut.revert === testCase.code,
                    },
                ]);
            }
            // assert
            for (const action of actions) {
                it(action.testName, () => {
                    const sut = action.act();
                    expect(action.expect(sut));
                });
            }
        });
    });
});

class ScriptCodeBuilder {
    public execute = 'default-execute-code';
    public revert = '';
    public scriptName = 'default-script-name';
    public syntax: ILanguageSyntax = new LanguageSyntaxStub();

    public withName(name: string) {
        this.scriptName = name;
        return this;
    }
    public withExecute(execute: string) {
        this.execute = execute;
        return this;
    }
    public withRevert(revert: string) {
        this.revert = revert;
        return this;
    }
    public withSyntax(syntax: ILanguageSyntax) {
        this.syntax = syntax;
        return this;
    }

    public build(): ScriptCode {
        return new ScriptCode(
            this.execute,
            this.revert,
            this.scriptName,
            this.syntax);
    }
}
