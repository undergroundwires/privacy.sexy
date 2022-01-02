import { FunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { IReadOnlyFunctionCallArgumentCollection } from '../../Function/Call/Argument/IFunctionCallArgumentCollection';
import { IReadOnlyFunctionParameterCollection } from '../../Function/Parameter/IFunctionParameterCollection';
import { FunctionCallArgumentCollection } from '../../Function/Call/Argument/FunctionCallArgumentCollection';
import { IExpression } from './IExpression';
import { ExpressionPosition } from './ExpressionPosition';
import { ExpressionEvaluationContext, IExpressionEvaluationContext } from './ExpressionEvaluationContext';

export type ExpressionEvaluator = (context: IExpressionEvaluationContext) => string;
export class Expression implements IExpression {
  constructor(
    public readonly position: ExpressionPosition,
    public readonly evaluator: ExpressionEvaluator,
    public readonly parameters
      : IReadOnlyFunctionParameterCollection = new FunctionParameterCollection(),
  ) {
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
    const filteredContext = new ExpressionEvaluationContext(args, context.pipelineCompiler);
    return this.evaluator(filteredContext);
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
