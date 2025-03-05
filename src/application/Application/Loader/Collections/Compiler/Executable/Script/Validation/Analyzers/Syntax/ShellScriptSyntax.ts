import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';

export class ShellScriptSyntax implements LanguageSyntax {
  public readonly commentDelimiters = ['#'];

  public readonly commonCodeParts = ['(', ')', 'else', 'fi', 'done'];
}
