import type { FunctionData } from '@/application/collections/';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export interface ISharedFunctionsParser {
  parseFunctions(functions: readonly FunctionData[]): ISharedFunctionCollection;
}
