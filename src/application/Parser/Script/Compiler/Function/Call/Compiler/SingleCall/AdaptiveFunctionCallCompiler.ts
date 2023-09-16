import { FunctionCall } from '../../FunctionCall';
import { CompiledCode } from '../CompiledCode';
import { FunctionCallCompilationContext } from '../FunctionCallCompilationContext';
import { IReadOnlyFunctionCallArgumentCollection } from '../../Argument/IFunctionCallArgumentCollection';
import { ISharedFunction } from '../../../ISharedFunction';
import { SingleCallCompiler } from './SingleCallCompiler';
import { SingleCallCompilerStrategy } from './SingleCallCompilerStrategy';
import { InlineFunctionCallCompiler } from './Strategies/InlineFunctionCallCompiler';
import { NestedFunctionCallCompiler } from './Strategies/NestedFunctionCallCompiler';

export class AdaptiveFunctionCallCompiler implements SingleCallCompiler {
  public constructor(
    private readonly strategies: SingleCallCompilerStrategy[] = [
      new InlineFunctionCallCompiler(),
      new NestedFunctionCallCompiler(),
    ],
  ) {
  }

  public compileSingleCall(
    call: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[] {
    const func = context.allFunctions.getFunctionByName(call.functionName);
    ensureThatCallArgumentsExistInParameterDefinition(func, call.args);
    const strategy = this.findStrategy(func);
    return strategy.compileFunction(func, call, context);
  }

  private findStrategy(func: ISharedFunction): SingleCallCompilerStrategy {
    const strategies = this.strategies.filter((strategy) => strategy.canCompile(func));
    if (strategies.length > 1) {
      throw new Error('Multiple strategies found to compile the function call.');
    }
    if (strategies.length === 0) {
      throw new Error('No strategies found to compile the function call.');
    }
    return strategies[0];
  }
}

function ensureThatCallArgumentsExistInParameterDefinition(
  func: ISharedFunction,
  callArguments: IReadOnlyFunctionCallArgumentCollection,
): void {
  const callArgumentNames = callArguments.getAllParameterNames();
  const functionParameterNames = func.parameters.all.map((param) => param.name) || [];
  const unexpectedParameters = findUnexpectedParameters(callArgumentNames, functionParameterNames);
  throwIfUnexpectedParametersExist(func.name, unexpectedParameters, functionParameterNames);
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

function throwIfUnexpectedParametersExist(
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
