import { describe } from 'vitest';
import { SyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Syntax/SyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellScriptSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ShellScriptSyntax';
import { ScriptingLanguageFactoryTestRunner } from '@tests/unit/application/Common/ScriptingLanguage/ScriptingLanguageFactoryTestRunner';
import { BatchFileSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/BatchFileSyntax';

describe('SyntaxFactory', () => {
  const sut = new SyntaxFactory();
  const runner = new ScriptingLanguageFactoryTestRunner()
    .expectInstance(ScriptingLanguage.shellscript, ShellScriptSyntax)
    .expectInstance(ScriptingLanguage.batchfile, BatchFileSyntax);
  runner.testCreateMethod(sut);
});
