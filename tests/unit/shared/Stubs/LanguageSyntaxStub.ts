import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';

export class LanguageSyntaxStub implements LanguageSyntax {
  public commentDelimiters: string[] = [];

  public commonCodeParts: string[] = [];

  public withCommentDelimiters(...delimiters: string[]) {
    this.commentDelimiters = delimiters;
    return this;
  }

  public withCommonCodeParts(...codeParts: string[]) {
    this.commonCodeParts = codeParts;
    return this;
  }
}
