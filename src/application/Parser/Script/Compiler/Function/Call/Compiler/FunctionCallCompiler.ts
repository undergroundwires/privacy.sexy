import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { FunctionCall } from '../FunctionCall';
import { CompiledCode } from './CompiledCode';

export interface FunctionCallCompiler {
  compileFunctionCalls(
    calls: readonly FunctionCall[],
    functions: ISharedFunctionCollection,
  ): CompiledCode;
}
