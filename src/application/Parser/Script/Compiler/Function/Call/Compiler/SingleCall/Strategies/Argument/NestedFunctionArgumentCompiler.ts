import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { FunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgumentCollection';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import type { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { ParsedFunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/ParsedFunctionCall';
import type { ArgumentCompiler } from './ArgumentCompiler';

export class NestedFunctionArgumentCompiler implements ArgumentCompiler {
  constructor(
    private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler(),
  ) { }

  public createCompiledNestedCall(
    nestedFunction: FunctionCall,
    parentFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall {
    const compiledArgs = compileNestedFunctionArguments(
      nestedFunction,
      parentFunction.args,
      context,
      this.expressionsCompiler,
    );
    const compiledCall = new ParsedFunctionCall(nestedFunction.functionName, compiledArgs);
    return compiledCall;
  }
}

function compileNestedFunctionArguments(
  nestedFunction: FunctionCall,
  parentFunctionArgs: IReadOnlyFunctionCallArgumentCollection,
  context: FunctionCallCompilationContext,
  expressionsCompiler: IExpressionsCompiler,
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
        expressionsCompiler,
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
    }) => new FunctionCallArgument(parameterName, compiledArgumentValue));
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
  expressionsCompiler: IExpressionsCompiler,
): string {
  try {
    const { argumentValue: codeInArgument } = nestedFunction.args.getArgument(parameterName);
    return expressionsCompiler.compileExpressions(codeInArgument, parentFunctionArgs);
  } catch (err) {
    throw new AggregateError([err], `Error when compiling argument for "${parameterName}"`);
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
