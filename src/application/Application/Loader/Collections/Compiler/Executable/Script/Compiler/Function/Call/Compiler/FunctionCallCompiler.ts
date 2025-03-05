import type { ISharedFunctionCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import type { CompiledCode } from './CompiledCode';
import type { FunctionCall } from '../FunctionCall';

export interface FunctionCallCompiler {
  compileFunctionCalls(
    calls: readonly FunctionCall[],
    functions: ISharedFunctionCollection,
  ): CompiledCode;
}
