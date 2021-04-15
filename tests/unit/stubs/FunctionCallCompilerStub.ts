import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { ICompiledCode } from '@/application/Parser/Script/Compiler/FunctionCall/ICompiledCode';
import { IFunctionCallCompiler } from '@/application/Parser/Script/Compiler/FunctionCall/IFunctionCallCompiler';
import { FunctionCallData, ScriptFunctionCallData } from 'js-yaml-loader!@/*';

interface Scenario { call: ScriptFunctionCallData; functions: ISharedFunctionCollection; result: ICompiledCode; }

export class FunctionCallCompilerStub implements IFunctionCallCompiler {
    public scenarios = new Array<Scenario>();
    public setup(call: ScriptFunctionCallData, functions: ISharedFunctionCollection, result: ICompiledCode) {
        this.scenarios.push({ call, functions, result });
    }
    public compileCall(
        call: ScriptFunctionCallData,
        functions: ISharedFunctionCollection): ICompiledCode {
        const predefined = this.scenarios.find((s) => s.call === call && s.functions === functions);
        if (predefined) {
            return predefined.result;
        }
        const callee = functions.getFunctionByName((call as FunctionCallData).function);
        return {
            code: callee.code,
            revertCode: callee.revertCode,
        };
    }
}
