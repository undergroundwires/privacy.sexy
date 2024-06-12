import type { ISharedFunctionCollection } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import type { FunctionCall } from '../FunctionCall';
import type { SingleCallCompiler } from './SingleCall/SingleCallCompiler';

export interface FunctionCallCompilationContext {
  readonly allFunctions: ISharedFunctionCollection;
  readonly rootCallSequence: readonly FunctionCall[];
  readonly singleCallCompiler: SingleCallCompiler;
}
