import {
  type CallFunctionBody, FunctionBodyType,
  type ISharedFunction,
} from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import { NestedFunctionArgumentCompiler } from './Argument/NestedFunctionArgumentCompiler';
import type { SingleCallCompilerStrategy } from '../SingleCallCompilerStrategy';
import type { ArgumentCompiler } from './Argument/ArgumentCompiler';

export class NestedFunctionCallCompiler implements SingleCallCompilerStrategy {
  public constructor(
    private readonly argumentCompiler: ArgumentCompiler
    = new NestedFunctionArgumentCompiler(),
    private readonly wrapError: ErrorWithContextWrapper
    = wrapErrorWithAdditionalContext,
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
      } catch (error) {
        throw this.wrapError(
          error,
          `Failed to call '${nestedCall.functionName}' (callee function) from '${callToFunction.functionName}' (caller function).`,
        );
      }
    }).flat();
  }
}
