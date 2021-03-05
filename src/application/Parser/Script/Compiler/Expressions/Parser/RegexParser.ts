import { IExpressionParser } from './IExpressionParser';
import { ExpressionPosition } from '../Expression/ExpressionPosition';
import { IExpression } from '../Expression/IExpression';
import { Expression, ExpressionEvaluator } from '../Expression/Expression';

export abstract class RegexParser implements IExpressionParser {
    protected abstract readonly regex: RegExp;
    public findExpressions(code: string): IExpression[] {
        return Array.from(this.findRegexExpressions(code));
    }

    protected abstract buildExpression(match: RegExpMatchArray): IPrimitiveExpression;

    private* findRegexExpressions(code: string): Iterable<IExpression> {
        const matches = Array.from(code.matchAll(this.regex));
        for (const match of matches) {
            const startPos = match.index;
            const endPos = startPos + match[0].length;
            let position: ExpressionPosition;
            try {
                position = new ExpressionPosition(startPos, endPos);
            } catch (error) {
                throw new Error(`[${this.constructor.name}] invalid script position: ${error.message}\nRegex ${this.regex}\nCode: ${code}`);
            }
            const primitiveExpression = this.buildExpression(match);
            const expression = new Expression(position, primitiveExpression.evaluator, primitiveExpression.parameters);
            yield expression;
        }
    }
}

export interface IPrimitiveExpression {
    evaluator: ExpressionEvaluator;
    parameters?: readonly string[];
}
