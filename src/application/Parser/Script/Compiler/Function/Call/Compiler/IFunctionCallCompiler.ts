import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { IFunctionCall } from '../IFunctionCall';
import { ICompiledCode } from './ICompiledCode';

export interface IFunctionCallCompiler {
  compileCall(
    calls: IFunctionCall[],
    functions: ISharedFunctionCollection): ICompiledCode;
}
