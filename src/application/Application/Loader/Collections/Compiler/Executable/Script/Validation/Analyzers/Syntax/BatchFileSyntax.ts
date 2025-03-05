import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';

const BatchFileCommonCodeParts = ['(', ')', 'else', '||'];
const PowerShellCommonCodeParts = ['{', '}'];

export class BatchFileSyntax implements LanguageSyntax {
  public readonly commentDelimiters = ['REM', '::'];

  public readonly commonCodeParts = [...BatchFileCommonCodeParts, ...PowerShellCommonCodeParts];
}
