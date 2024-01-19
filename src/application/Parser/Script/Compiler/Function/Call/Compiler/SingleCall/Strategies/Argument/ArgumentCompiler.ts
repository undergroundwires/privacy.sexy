import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';

export interface ArgumentCompiler {
  createCompiledNestedCall(
    nestedFunctionCall: FunctionCall,
    parentFunctionCall: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall;
}
