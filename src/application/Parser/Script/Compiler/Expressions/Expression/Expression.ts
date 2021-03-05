import { ExpressionPosition } from './ExpressionPosition';
import { ExpressionArguments, IExpression } from './IExpression';

export type ExpressionEvaluator = (args?: ExpressionArguments) => string;
export class Expression implements IExpression {
    constructor(
        public readonly position: ExpressionPosition,
        public readonly evaluator: ExpressionEvaluator,
        public readonly parameters: readonly string[] = new Array<string>()) {
        if (!position) {
            throw new Error('undefined position');
        }
        if (!evaluator) {
            throw new Error('undefined evaluator');
        }
    }
    public evaluate(args?: ExpressionArguments): string {
        args = filterUnusedArguments(this.parameters, args);
        return this.evaluator(args);
    }
}

function filterUnusedArguments(
    parameters: readonly string[], args: ExpressionArguments): ExpressionArguments {
    let result: ExpressionArguments = {};
    for (const parameter of Object.keys(args)) {
        if (parameters.includes(parameter)) {
            result = {
                ...result,
                [parameter]: args[parameter],
            };
        }
    }
    return result;
}
