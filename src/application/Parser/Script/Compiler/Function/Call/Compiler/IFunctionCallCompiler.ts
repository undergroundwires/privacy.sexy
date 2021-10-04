import { ICompiledCode } from './ICompiledCode';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { IFunctionCall } from '../IFunctionCall';

export interface IFunctionCallCompiler {
    compileCall(
        calls: IFunctionCall[],
        functions: ISharedFunctionCollection): ICompiledCode;
}
