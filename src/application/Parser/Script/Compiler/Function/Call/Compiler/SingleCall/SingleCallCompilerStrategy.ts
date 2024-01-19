import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { CompiledCode } from '../CompiledCode';
import { FunctionCallCompilationContext } from '../FunctionCallCompilationContext';

export interface SingleCallCompilerStrategy {
  canCompile(func: ISharedFunction): boolean;
  compileFunction(
    calledFunction: ISharedFunction,
    callToFunction: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[],
}
