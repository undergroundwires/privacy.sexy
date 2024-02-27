import { type CallFunctionBody, FunctionBodyType, type ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { NestedFunctionArgumentCompiler } from './Argument/NestedFunctionArgumentCompiler';
import type { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';
import type { ArgumentCompiler } from './Argument/ArgumentCompiler';

export class NestedFunctionCallCompiler implements SingleCallCompilerStrategy {
  public constructor(
    private readonly argumentCompiler: ArgumentCompiler = new NestedFunctionArgumentCompiler(),
  ) {
  }

  public canCompile(func: ISharedFunction): boolean {
    return func.body.type === FunctionBodyType.Calls;
  }

  public compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[] {
    const nestedCalls = (calledFunction.body as CallFunctionBody).calls;
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
