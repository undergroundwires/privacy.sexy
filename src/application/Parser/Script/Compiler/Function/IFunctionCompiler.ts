import { FunctionData } from 'js-yaml-loader!@/*';
import { ISharedFunctionCollection } from './ISharedFunctionCollection';

export interface IFunctionCompiler {
    compileFunctions(functions: readonly FunctionData[]): ISharedFunctionCollection;
}
