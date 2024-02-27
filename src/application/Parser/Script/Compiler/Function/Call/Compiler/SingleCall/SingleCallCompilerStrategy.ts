import type { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { CompiledCode } from '../CompiledCode';
import type { FunctionCallCompilationContext } from '../FunctionCallCompilationContext';

export interface SingleCallCompilerStrategy {
  canCompile(func: ISharedFunction): boolean;
  compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[],
}
