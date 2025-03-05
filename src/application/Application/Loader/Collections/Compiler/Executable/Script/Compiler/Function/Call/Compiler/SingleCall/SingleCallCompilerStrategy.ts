import type { ISharedFunction } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunction';
import type { FunctionCall } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/FunctionCall';
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
