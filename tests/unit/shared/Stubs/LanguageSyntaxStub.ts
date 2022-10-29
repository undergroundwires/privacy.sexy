import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';

export class LanguageSyntaxStub implements ILanguageSyntax {
  public commentDelimiters = [];

  public commonCodeParts = [];

  public withCommentDelimiters(...delimiters: string[]) {
    this.commentDelimiters = delimiters;
    return this;
  }

  public withCommonCodeParts(...codeParts: string[]) {
    this.commonCodeParts = codeParts;
    return this;
  }
}
