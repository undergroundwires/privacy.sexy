import { FunctionParameterCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollection';
import { FunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { type IExpressionEvaluationContext, ExpressionEvaluationContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { ExpressionPosition } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/ExpressionPosition';
import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import type { IReadOnlyFunctionParameterCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import type { IExpression } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/IExpression';
import { indentText } from '@/application/Common/Text/IndentText';

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
    // .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates
  const missingParameterNames = requiredParameterNames
    .filter((parameterName) => !args.hasArgument(parameterName));
  if (missingParameterNames.length) {
    throw new Error([
      'Some parameters are used in code, but their values are not provided.',
      `Used parameters missing values (${missingParameterNames.length}):`,
      ...missingParameterNames
        .map((parameterName, index) => `${index + 1}. ${parameterName}`)
        .map((item) => indentText(item)),
    ].join('\n'));
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
