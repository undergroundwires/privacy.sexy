import { ExpressionPosition } from './ExpressionPosition';
import { IExpression } from './IExpression';
import { IReadOnlyFunctionCallArgumentCollection } from '../../Function/Call/Argument/IFunctionCallArgumentCollection';
import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import { FunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionCallArgumentCollection } from '../../Function/Call/Argument/FunctionCallArgumentCollection';
import { IExpressionEvaluationContext } from './ExpressionEvaluationContext';
import { ExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';

export type ExpressionEvaluator = (context: IExpressionEvaluationContext) => string;
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
    public evaluate(context: IExpressionEvaluationContext): string {
        if (!context) {
            throw new Error('undefined context');
        }
        validateThatAllRequiredParametersAreSatisfied(this.parameters, context.args);
        const args = filterUnusedArguments(this.parameters, context.args);
        context = new ExpressionEvaluationContext(args, context.pipelineCompiler);
        return this.evaluator(context);
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
