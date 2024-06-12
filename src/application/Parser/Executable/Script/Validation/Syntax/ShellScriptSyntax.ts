import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';

export class ShellScriptSyntax implements ILanguageSyntax {
  public readonly commentDelimiters = ['#'];

  public readonly commonCodeParts = ['(', ')', 'else', 'fi', 'done'];
}
