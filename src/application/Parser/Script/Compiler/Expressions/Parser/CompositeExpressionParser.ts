import { IExpression } from '../Expression/IExpression';
import { IExpressionParser } from './IExpressionParser';
import { ParameterSubstitutionParser } from '../SyntaxParsers/ParameterSubstitutionParser';
import { WithParser } from '../SyntaxParsers/WithParser';

const Parsers = [
    new ParameterSubstitutionParser(),
    new WithParser(),
];

export class CompositeExpressionParser implements IExpressionParser {
    public constructor(private readonly leafs: readonly IExpressionParser[] = Parsers) {
        if (leafs.some((leaf) => !leaf)) {
            throw new Error('undefined leaf');
        }
    }
    public findExpressions(code: string): IExpression[] {
        const expressions = new Array<IExpression>();
        for (const parser of this.leafs) {
            const newExpressions = parser.findExpressions(code);
            if (newExpressions && newExpressions.length) {
                expressions.push(...newExpressions);
            }
        }
        return expressions;
    }
}
