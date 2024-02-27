import type { FunctionCallCompilationContext } from '../FunctionCallCompilationContext';
import type { FunctionCall } from '../../FunctionCall';
import type { CompiledCode } from '../CompiledCode';

export interface SingleCallCompiler {
  compileSingleCall(
    call: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[];
}
