import { describe } from 'vitest';
import { ShellScriptSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/ShellScriptSyntax';
import { runLanguageSyntaxTests } from './LanguageSyntaxTestRunner';

describe('ShellScriptSyntax', () => {
  runLanguageSyntaxTests(
    () => new ShellScriptSyntax(),
  );
});
