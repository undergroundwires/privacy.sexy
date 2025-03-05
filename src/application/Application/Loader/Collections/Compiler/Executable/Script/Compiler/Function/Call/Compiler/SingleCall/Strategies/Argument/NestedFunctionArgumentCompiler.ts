import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { ExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/ExpressionsCompiler';
import type { IExpressionsCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/IExpressionsCompiler';
import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { ParsedFunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/ParsedFunctionCall';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Application/Loader/Collections/Compiler/Common/ContextualError';
import { createFunctionCallArgument, type FunctionCallArgument, type FunctionCallArgumentFactory } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import type { ArgumentCompiler } from './ArgumentCompiler';

export class NestedFunctionArgumentCompiler implements ArgumentCompiler {
  constructor(private readonly utilities: ArgumentCompilationUtilities = DefaultUtilities) { }

  public createCompiledNestedCall(
    nestedFunction: FunctionCall,
    parentFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall {
    const compiledArgs = compileNestedFunctionArguments(
      nestedFunction,
      parentFunction.args,
      context,
      this.utilities,
    );
    const compiledCall = new ParsedFunctionCall(nestedFunction.functionName, compiledArgs);
    return compiledCall;
  }
}

interface ArgumentCompilationUtilities {
  readonly expressionsCompiler: IExpressionsCompiler,
  readonly wrapError: ErrorWithContextWrapper;
  readonly createCallArgument: FunctionCallArgumentFactory;
}

function compileNestedFunctionArguments(
  nestedFunction: FunctionCall,
  parentFunctionArgs: IReadOnlyFunctionCallArgumentCollection,
  context: FunctionCallCompilationContext,
  utilities: ArgumentCompilationUtilities,
): IReadOnlyFunctionCallArgumentCollection {
  const requiredParameterNames = context
    .allFunctions
    .getRequiredParameterNames(nestedFunction.functionName);
  const compiledArguments = nestedFunction.args
    .getAllParameterNames()
    // Compile each argument value
    .map((paramName) => ({
      parameterName: paramName,
      compiledArgumentValue: compileArgument(
        paramName,
        nestedFunction,
        parentFunctionArgs,
        utilities,
      ),
    }))
    // Filter out arguments with absent values
    .filter(({
      parameterName,
      compiledArgumentValue,
    }) => isValidNonAbsentArgumentValue(
      parameterName,
      compiledArgumentValue,
      requiredParameterNames,
    ))
    /*
      Create argument object with non-absent values.
      This is done after eliminating absent values because otherwise creating argument object
      with absent values throws error.
    */
    .map(({
      parameterName,
      compiledArgumentValue,
    }) => utilities.createCallArgument(parameterName, compiledArgumentValue));
  return buildArgumentCollectionFromArguments(compiledArguments);
}

function isValidNonAbsentArgumentValue(
  parameterName: string,
  argumentValue: string | undefined,
  requiredParameterNames: string[],
): boolean {
  if (argumentValue) {
    return true;
  }
  if (!requiredParameterNames.includes(parameterName)) {
    return false;
  }
  throw new Error(`Compilation resulted in empty value for required parameter: "${parameterName}"`);
}

function compileArgument(
  parameterName: string,
  nestedFunction: FunctionCall,
  parentFunctionArgs: IReadOnlyFunctionCallArgumentCollection,
  utilities: ArgumentCompilationUtilities,
): string {
  try {
    const { argumentValue: codeInArgument } = nestedFunction.args.getArgument(parameterName);
    return utilities.expressionsCompiler.compileExpressions(codeInArgument, parentFunctionArgs);
  } catch (error) {
    throw utilities.wrapError(error, `Error when compiling argument for "${parameterName}"`);
  }
}

function buildArgumentCollectionFromArguments(
  args: FunctionCallArgument[],
): FunctionCallArgumentCollection {
  return args.reduce((compiledArgs, arg) => {
    compiledArgs.addArgument(arg);
    return compiledArgs;
  }, new FunctionCallArgumentCollection());
}

const DefaultUtilities: ArgumentCompilationUtilities = {
  expressionsCompiler: new ExpressionsCompiler(),
  wrapError: wrapErrorWithAdditionalContext,
  createCallArgument: createFunctionCallArgument,
};
