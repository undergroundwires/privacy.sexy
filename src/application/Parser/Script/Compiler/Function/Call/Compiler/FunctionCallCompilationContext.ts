import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { FunctionCall } from '../FunctionCall';
import type { SingleCallCompiler } from './SingleCall/SingleCallCompiler';

export interface FunctionCallCompilationContext {
  readonly allFunctions: ISharedFunctionCollection;
  readonly rootCallSequence: readonly FunctionCall[];
  readonly singleCallCompiler: SingleCallCompiler;
}
