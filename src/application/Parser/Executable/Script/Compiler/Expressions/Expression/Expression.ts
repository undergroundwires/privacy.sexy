import { FunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionCallArgumentCollection } from '../../Function/Call/Argument/FunctionCallArgumentCollection';
import { ExpressionEvaluationContext, type IExpressionEvaluationContext } from './ExpressionEvaluationContext';
import { ExpressionPosition } from './ExpressionPosition';
import type { IReadOnlyFunctionCallArgumentCollection } from '../../Function/Call/Argument/IFunctionCallArgumentCollection';
import type { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import type { IExpression } from './IExpression';

export type ExpressionEvaluator = (context: IExpressionEvaluationContext) => string;

export class Expression implements IExpression {
  public readonly parameters: IReadOnlyFunctionParameterCollection;

  public readonly position: ExpressionPosition;

  public readonly evaluator: ExpressionEvaluator;

  constructor(parameters: ExpressionInitParameters) {
    this.parameters = parameters.parameters ?? new FunctionParameterCollection();
    this.evaluator = parameters.evaluator;
    this.position = parameters.position;
  }

  public evaluate(context: IExpressionEvaluationContext): string {
    validateThatAllRequiredParametersAreSatisfied(this.parameters, context.args);
    const args = filterUnusedArguments(this.parameters, context.args);
    const filteredContext = new ExpressionEvaluationContext(args, context.pipelineCompiler);
    return this.evaluator(filteredContext);
  }
}

export interface ExpressionInitParameters {
  readonly position: ExpressionPosition,
  readonly evaluator: ExpressionEvaluator,
  readonly parameters?: IReadOnlyFunctionParameterCollection,
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
      `argument values are provided for required parameters: "${missingParameterNames.join('", "')}"`,
    );
  }
}

function filterUnusedArguments(
  parameters: IReadOnlyFunctionParameterCollection,
  allFunctionArgs: IReadOnlyFunctionCallArgumentCollection,
): IReadOnlyFunctionCallArgumentCollection {
  const specificCallArgs = new FunctionCallArgumentCollection();
  parameters.all
    .filter((parameter) => allFunctionArgs.hasArgument(parameter.name))
    .map((parameter) => allFunctionArgs.getArgument(parameter.name))
    .forEach((argument) => specificCallArgs.addArgument(argument));
  return specificCallArgs;
}
