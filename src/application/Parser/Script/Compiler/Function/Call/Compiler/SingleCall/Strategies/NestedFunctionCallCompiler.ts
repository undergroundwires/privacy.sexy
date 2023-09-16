import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';
import { ArgumentCompiler } from './Argument/ArgumentCompiler';
import { NestedFunctionArgumentCompiler } from './Argument/NestedFunctionArgumentCompiler';

export class NestedFunctionCallCompiler implements SingleCallCompilerStrategy {
  public constructor(
    private readonly argumentCompiler: ArgumentCompiler = new NestedFunctionArgumentCompiler(),
  ) {
  }

  public canCompile(func: ISharedFunction): boolean {
    return func.body.calls !== undefined;
  }

  public compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[] {
    const nestedCalls = calledFunction.body.calls;
    return nestedCalls.map((nestedCall) => {
      try {
        const compiledParentCall = this.argumentCompiler
          .createCompiledNestedCall(nestedCall, callToFunction, context);
        const compiledNestedCall = context.singleCallCompiler
          .compileSingleCall(compiledParentCall, context);
        return compiledNestedCall;
      } catch (err) {
        throw new AggregateError([err], `Error with call to "${nestedCall.functionName}" function from "${callToFunction.functionName}" function`);
      }
    }).flat();
  }
}
