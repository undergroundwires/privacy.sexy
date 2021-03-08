import 'mocha';
import { expect } from 'chai';
import { SyntaxFactory } from '@/application/Parser/Script/Syntax/SyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellScriptSyntax } from '@/application/Parser/Script/Syntax/ShellScriptSyntax';
import { BatchFileSyntax } from '@/application/Parser/Script/Syntax/BatchFileSyntax';

describe('SyntaxFactory', () => {
    describe('getSyntax', () => {
        describe('creates expected type', () => {
            describe('shellscript returns ShellBuilder', () => {
                // arrange
                const testCases: Array< { language: ScriptingLanguage, expected: any} > = [
                    { language: ScriptingLanguage.shellscript,  expected: ShellScriptSyntax},
                    { language: ScriptingLanguage.batchfile,    expected: BatchFileSyntax},
                ];
                for (const testCase of testCases) {
                    it(ScriptingLanguage[testCase.language], () => {
                        // act
                        const sut = new SyntaxFactory();
                        const result = sut.create(testCase.language);
                        // assert
                        expect(result).to.be.instanceOf(testCase.expected,
                            `Actual was: ${result.constructor.name}`);
                    });
                }
            });
        });
        it('throws on unknown scripting language', () => {
            // arrange
            const sut = new SyntaxFactory();
            // act
            const act = () => sut.create(3131313131);
            // assert
            expect(act).to.throw(`unknown language: "${ScriptingLanguage[3131313131]}"`);
        });
    });
});
