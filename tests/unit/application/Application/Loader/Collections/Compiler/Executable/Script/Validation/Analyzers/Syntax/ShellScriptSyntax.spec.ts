import { describe } from 'vitest';
import { ShellScriptSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/ShellScriptSyntax';
import { runLanguageSyntaxTests } from './LanguageSyntaxTestRunner';

describe('ShellScriptSyntax', () => {
  runLanguageSyntaxTests(
    () => new ShellScriptSyntax(),
  );
});
