import { ScriptFunctionCallData } from 'js-yaml-loader!*';
import { ICompiledCode } from './ICompiledCode';
import { ISharedFunctionCollection } from '../Function/ISharedFunctionCollection';

export interface IFunctionCallCompiler {
    compileCall(
        call: ScriptFunctionCallData,
        functions: ISharedFunctionCollection): ICompiledCode;
}
