import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { SyntaxFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';

interface PredeterminedSyntax {
  readonly givenLanguage: ScriptLanguage;
  readonly predeterminedSyntax: LanguageSyntax;
}

export class SyntaxFactoryStub {
  private readonly predeterminedResults = new Array<PredeterminedSyntax>();

  public withPredeterminedSyntax(scenario: PredeterminedSyntax): this {
    this.predeterminedResults.push(scenario);
    return this;
  }

  public get(): SyntaxFactory {
    return (language): LanguageSyntax => {
      const results = this.predeterminedResults.filter((r) => r.givenLanguage === language);
      if (results.length === 0) {
        return new LanguageSyntaxStub();
      }
      if (results.length > 1) {
        throw new Error(`Logical error: More than single predetermined results for ${ScriptLanguage[language]}`);
      }
      return results[0].predeterminedSyntax;
    };
  }
}
