import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { SyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';

interface PredeterminedSyntax {
  readonly givenLanguage: ScriptingLanguage;
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
        throw new Error(`Logical error: More than single predetermined results for ${ScriptingLanguage[language]}`);
      }
      return results[0].predeterminedSyntax;
    };
  }
}
