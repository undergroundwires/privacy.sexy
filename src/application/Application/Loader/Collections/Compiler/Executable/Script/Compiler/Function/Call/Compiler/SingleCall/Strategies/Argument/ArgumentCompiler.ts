import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';

export interface ArgumentCompiler {
  createCompiledNestedCall(
    nestedFunctionCall: FunctionCall,
    parentFunctionCall: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall;
}
