import 'mocha';
import { expect } from 'chai';
import { ScriptCode } from '@/domain/ScriptCode';
import { IScriptCode } from '@/domain/IScriptCode';

describe('ScriptCode', () => {
    describe('scriptName', () => {
        it('throws if undefined', () => {
            // arrange
            const expectedError = 'name is undefined';
            const name = undefined;
            // act
            const act = () => new ScriptCode(name, 'non-empty-code', '');
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
                    const act = () => new ScriptCode(scriptName, testCase.code.execute, testCase.code.revert);
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
                const substituteScriptName = (name) => testCase.expectedMessage.replace('$scriptName', name);
                actions.push(...[
                    {
                        act: () => new ScriptCode(scriptName, testCase.code, undefined),
                        testName: `execute: ${testCase.testName}`,
                        expectedMessage: substituteScriptName(scriptName),
                    },
                    {
                        act: () => new ScriptCode(scriptName, 'valid code', testCase.code),
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
            const testCases = [
                {
                    testName: 'code is a valid string',
                    code: 'valid code',
                },
                {
                    testName: 'code consists of frequent code parts',
                    code: ') else (',
                },
                {
                    testName: 'code is a frequent code part',
                    code: ')',
                },
                {
                    testName: 'code with duplicated comment lines (::)',
                    code: ':: comment\n:: comment',
                },
                {
                    testName: 'code with duplicated comment lines (REM)',
                    code: 'REM comment\nREM comment',
                },
            ];
            // act
            const actions = [];
            for (const testCase of testCases) {
                actions.push(...[
                    {
                        testName: `execute: ${testCase.testName}`,
                        act: () => createSut(testCase.code),
                        expect: (sut: IScriptCode) => sut.execute === testCase.code,
                    },
                    {
                        testName: `revert: ${testCase.testName}`,
                        act: () => createSut('different code', testCase.code),
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

function createSut(code: string, revert = ''): ScriptCode {
    return new ScriptCode('test-code', code, revert);
}
