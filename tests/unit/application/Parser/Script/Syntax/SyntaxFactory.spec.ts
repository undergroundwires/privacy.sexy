import 'mocha';
import { SyntaxFactory } from '@/application/Parser/Script/Syntax/SyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellScriptSyntax } from '@/application/Parser/Script/Syntax/ShellScriptSyntax';
import { BatchFileSyntax } from '@/application/Parser/Script/Syntax/BatchFileSyntax';
import { ScriptingLanguageFactoryTestRunner } from '@tests/unit/application/Common/ScriptingLanguage/ScriptingLanguageFactoryTestRunner';

describe('SyntaxFactory', () => {
    const sut = new SyntaxFactory();
    const runner = new ScriptingLanguageFactoryTestRunner()
        .expect(ScriptingLanguage.shellscript, ShellScriptSyntax)
        .expect(ScriptingLanguage.batchfile, BatchFileSyntax);
    runner.testCreateMethod(sut);
});
