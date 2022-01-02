import { FunctionData } from 'js-yaml-loader!@/*';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export interface ISharedFunctionsParser {
  parseFunctions(functions: readonly FunctionData[]): ISharedFunctionCollection;
}
