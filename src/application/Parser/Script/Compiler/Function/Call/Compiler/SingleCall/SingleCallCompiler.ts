import { FunctionCall } from '../../FunctionCall';
import { CompiledCode } from '../CompiledCode';
import { FunctionCallCompilationContext } from '../FunctionCallCompilationContext';

export interface SingleCallCompiler {
  compileSingleCall(
    call: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[];
}
