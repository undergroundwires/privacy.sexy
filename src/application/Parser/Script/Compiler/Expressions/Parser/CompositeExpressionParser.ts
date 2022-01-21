import { IExpression } from '../Expression/IExpression';
import { ParameterSubstitutionParser } from '../SyntaxParsers/ParameterSubstitutionParser';
import { WithParser } from '../SyntaxParsers/WithParser';
import { IExpressionParser } from './IExpressionParser';

const Parsers = [
  new ParameterSubstitutionParser(),
  new WithParser(),
];

export class CompositeExpressionParser implements IExpressionParser {
  public constructor(private readonly leafs: readonly IExpressionParser[] = Parsers) {
    if (!leafs) {
      throw new Error('missing leafs');
    }
    if (leafs.some((leaf) => !leaf)) {
      throw new Error('missing leaf');
    }
  }

  public findExpressions(code: string): IExpression[] {
    return this.leafs.flatMap(
      (parser) => parser.findExpressions(code) || [],
    );
  }
}
