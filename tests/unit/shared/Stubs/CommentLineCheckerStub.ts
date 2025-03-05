import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import type { CommentLineChecker } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Common/CommentLineChecker';

interface PredeterminedResult {
  readonly givenLine: string;
  readonly givenSyntax: LanguageSyntax;
  readonly result: boolean;
}

export class CommentLineCheckerStub {
  private readonly predeterminedResults = new Array<PredeterminedResult>();

  public withPredeterminedResult(scenario: PredeterminedResult): this {
    this.predeterminedResults.push(scenario);
    return this;
  }

  public get(): CommentLineChecker {
    return (line: string, syntax: LanguageSyntax): boolean => {
      const results = this.predeterminedResults
        .filter((r) => r.givenLine === line && r.givenSyntax === syntax);
      if (results.length === 0) {
        return false;
      }
      if (results.length > 1) {
        throw new Error(`Logical error: More than single predetermined results for line "${line}"`);
      }
      return results[0].result;
    };
  }
}
