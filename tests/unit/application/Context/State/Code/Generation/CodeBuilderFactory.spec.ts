import 'mocha';
import { expect } from 'chai';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellBuilder } from '@/application/Context/State/Code/Generation/Languages/ShellBuilder';
import { BatchBuilder } from '@/application/Context/State/Code/Generation/Languages/BatchBuilder';
import { CodeBuilderFactory } from '@/application/Context/State/Code/Generation/CodeBuilderFactory';

describe('CodeBuilderFactory', () => {
    describe('create', () => {
        describe('creates expected type', () => {
            // arrange
            const testCases: Array< { language: ScriptingLanguage, expected: any} > = [
                { language: ScriptingLanguage.shellscript,  expected: ShellBuilder},
                { language: ScriptingLanguage.batchfile,    expected: BatchBuilder},
            ];
            for (const testCase of testCases) {
                it(ScriptingLanguage[testCase.language], () => {
                    // act
                    const sut = new CodeBuilderFactory();
                    const result = sut.create(testCase.language);
                    // assert
                    expect(result).to.be.instanceOf(testCase.expected,
                        `Actual was: ${result.constructor.name}`);
                });
            }
        });
        it('throws on unknown scripting language', () => {
            // arrange
            const sut = new CodeBuilderFactory();
            // act
            const act = () => sut.create(3131313131);
            // assert
            expect(act).to.throw(`unknown language: "${ScriptingLanguage[3131313131]}"`);
        });
    });
});
