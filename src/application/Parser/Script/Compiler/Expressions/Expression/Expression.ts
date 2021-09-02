import { ExpressionPosition } from './ExpressionPosition';
import { IExpression } from './IExpression';
import { IReadOnlyFunctionCallArgumentCollection } from '../../FunctionCall/Argument/IFunctionCallArgumentCollection';
import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionCallArgumentCollection } from '../../FunctionCall/Argument/FunctionCallArgumentCollection';

export type ExpressionEvaluator = (args: IReadOnlyFunctionCallArgumentCollection) => string;
export class Expression implements IExpression {
    constructor(
        public readonly position: ExpressionPosition,
        public readonly evaluator: ExpressionEvaluator,
        public readonly parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollection()) {
        if (!position) {
            throw new Error('undefined position');
        }
        if (!evaluator) {
            throw new Error('undefined evaluator');
        }
    }
    public evaluate(args: IReadOnlyFunctionCallArgumentCollection): string {
        if (!args) {
            throw new Error('undefined args, send empty collection instead');
        }
        validateThatAllRequiredParametersAreSatisfied(this.parameters, args);
        args = filterUnusedArguments(this.parameters, args);
        return this.evaluator(args);
    }
}

function validateThatAllRequiredParametersAreSatisfied(
    parameters: IReadOnlyFunctionParameterCollection,
    args: IReadOnlyFunctionCallArgumentCollection,
) {
    const requiredParameterNames = parameters
        .all
        .filter((parameter) => !parameter.isOptional)
        .map((parameter) => parameter.name);
    const missingParameterNames = requiredParameterNames
        .filter((parameterName) => !args.hasArgument(parameterName));
    if (missingParameterNames.length) {
        throw new Error(
            `argument values are provided for required parameters: "${missingParameterNames.join('", "')}"`);
    }
}

function filterUnusedArguments(
    parameters: IReadOnlyFunctionParameterCollection,
    allFunctionArgs: IReadOnlyFunctionCallArgumentCollection): IReadOnlyFunctionCallArgumentCollection {
    const specificCallArgs = new FunctionCallArgumentCollection();
    for (const parameter of parameters.all) {
        if (parameter.isOptional && !allFunctionArgs.hasArgument(parameter.name)) {
            continue; // Optional parameter is not necessarily provided
        }
        const arg = allFunctionArgs.getArgument(parameter.name);
        specificCallArgs.addArgument(arg);
    }
    return specificCallArgs;
}
