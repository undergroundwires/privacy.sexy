import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { IFunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/IFunctionCall';
import { FunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { ISharedFunctionCollection } from '../../ISharedFunctionCollection';
import { IExpressionsCompiler } from '../../../Expressions/IExpressionsCompiler';
import { ExpressionsCompiler } from '../../../Expressions/ExpressionsCompiler';
import { ISharedFunction, IFunctionCode } from '../../ISharedFunction';
import { FunctionCall } from '../FunctionCall';
import { FunctionCallArgumentCollection } from '../Argument/FunctionCallArgumentCollection';
import { IFunctionCallCompiler } from './IFunctionCallCompiler';
import { ICompiledCode } from './ICompiledCode';

export class FunctionCallCompiler implements IFunctionCallCompiler {
  public static readonly instance: IFunctionCallCompiler = new FunctionCallCompiler();

  protected constructor(
    private readonly expressionsCompiler: IExpressionsCompiler = new ExpressionsCompiler(),
  ) {
  }

  public compileCall(
    calls: IFunctionCall[],
    functions: ISharedFunctionCollection,
  ): ICompiledCode {
    if (!functions) { throw new Error('missing functions'); }
    if (!calls) { throw new Error('missing calls'); }
    if (calls.some((f) => !f)) { throw new Error('missing function call'); }
    const context: ICompilationContext = {
      allFunctions: functions,
      callSequence: calls,
      expressionsCompiler: this.expressionsCompiler,
    };
    const code = compileCallSequence(context);
    return code;
  }
}

interface ICompilationContext {
  allFunctions: ISharedFunctionCollection;
  callSequence: readonly IFunctionCall[];
  expressionsCompiler: IExpressionsCompiler;
}

interface ICompiledFunctionCall {
  readonly code: string;
  readonly revertCode: string;
}

function compileCallSequence(context: ICompilationContext): ICompiledFunctionCall {
  const compiledFunctions = context.callSequence
    .flatMap((call) => compileSingleCall(call, context));
  return {
    code: merge(compiledFunctions.map((f) => f.code)),
    revertCode: merge(compiledFunctions.map((f) => f.revertCode)),
  };
}

function compileSingleCall(
  call: IFunctionCall,
  context: ICompilationContext,
): ICompiledFunctionCall[] {
  const func = context.allFunctions.getFunctionByName(call.functionName);
  ensureThatCallArgumentsExistInParameterDefinition(func, call.args);
  if (func.body.code) { // Function with inline code
    const compiledCode = compileCode(func.body.code, call.args, context.expressionsCompiler);
    return [compiledCode];
  }
  // Function with inner calls
  return func.body.calls
    .map((innerCall) => {
      const compiledArgs = compileArgs(innerCall.args, call.args, context.expressionsCompiler);
      const compiledCall = new FunctionCall(innerCall.functionName, compiledArgs);
      return compileSingleCall(compiledCall, context);
    })
    .flat();
}

function compileCode(
  code: IFunctionCode,
  args: IReadOnlyFunctionCallArgumentCollection,
  compiler: IExpressionsCompiler,
): ICompiledFunctionCall {
  return {
    code: compiler.compileExpressions(code.do, args),
    revertCode: compiler.compileExpressions(code.revert, args),
  };
}

function compileArgs(
  argsToCompile: IReadOnlyFunctionCallArgumentCollection,
  args: IReadOnlyFunctionCallArgumentCollection,
  compiler: IExpressionsCompiler,
): IReadOnlyFunctionCallArgumentCollection {
  return argsToCompile
    .getAllParameterNames()
    .map((parameterName) => {
      const { argumentValue } = argsToCompile.getArgument(parameterName);
      const compiledValue = compiler.compileExpressions(argumentValue, args);
      return new FunctionCallArgument(parameterName, compiledValue);
    })
    .reduce((compiledArgs, arg) => {
      compiledArgs.addArgument(arg);
      return compiledArgs;
    }, new FunctionCallArgumentCollection());
}

function merge(codeParts: readonly string[]): string {
  return codeParts
    .filter((part) => part?.length > 0)
    .join('\n');
}

function ensureThatCallArgumentsExistInParameterDefinition(
  func: ISharedFunction,
  args: IReadOnlyFunctionCallArgumentCollection,
): void {
  const callArgumentNames = args.getAllParameterNames();
  const functionParameterNames = func.parameters.all.map((param) => param.name) || [];
  const unexpectedParameters = findUnexpectedParameters(callArgumentNames, functionParameterNames);
  throwIfNotEmpty(func.name, unexpectedParameters, functionParameterNames);
}

function findUnexpectedParameters(
  callArgumentNames: string[],
  functionParameterNames: string[],
): string[] {
  if (!callArgumentNames.length && !functionParameterNames.length) {
    return [];
  }
  return callArgumentNames
    .filter((callParam) => !functionParameterNames.includes(callParam));
}

function throwIfNotEmpty(
  functionName: string,
  unexpectedParameters: string[],
  expectedParameters: string[],
) {
  if (!unexpectedParameters.length) {
    return;
  }
  throw new Error(
    // eslint-disable-next-line prefer-template
    `Function "${functionName}" has unexpected parameter(s) provided: `
      + `"${unexpectedParameters.join('", "')}"`
      + '. Expected parameter(s): '
      + (expectedParameters.length ? `"${expectedParameters.join('", "')}"` : 'none'),
  );
}
