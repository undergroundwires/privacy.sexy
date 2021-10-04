import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { FunctionData, ScriptData } from 'js-yaml-loader!@/*';
import { IScriptCompiler } from './IScriptCompiler';
import { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import { IFunctionCallCompiler } from './Function/Call/Compiler/IFunctionCallCompiler';
import { FunctionCallCompiler } from './Function/Call/Compiler/FunctionCallCompiler';
import { ISharedFunctionsParser } from './Function/ISharedFunctionsParser';
import { SharedFunctionsParser } from './Function/SharedFunctionsParser';
import { parseFunctionCalls } from './Function/Call/FunctionCallParser';

export class ScriptCompiler implements IScriptCompiler {
    private readonly functions: ISharedFunctionCollection;
    constructor(
        functions: readonly FunctionData[] | undefined,
        private readonly syntax: ILanguageSyntax,
        sharedFunctionsParser: ISharedFunctionsParser = SharedFunctionsParser.instance,
        private readonly callCompiler: IFunctionCallCompiler = FunctionCallCompiler.instance,
        ) {
        if (!syntax) { throw new Error('undefined syntax'); }
        this.functions = sharedFunctionsParser.parseFunctions(functions);
    }
    public canCompile(script: ScriptData): boolean {
        if (!script) { throw new Error('undefined script'); }
        if (!script.call) {
            return false;
        }
        return true;
    }
    public compile(script: ScriptData): IScriptCode {
        if (!script) { throw new Error('undefined script'); }
        try {
            const calls = parseFunctionCalls(script.call);
            const compiledCode = this.callCompiler.compileCall(calls, this.functions);
            return new ScriptCode(
                compiledCode.code,
                compiledCode.revertCode,
                this.syntax);
        } catch (error) {
            throw Error(`Script "${script.name}" ${error.message}`);
        }
    }
}
