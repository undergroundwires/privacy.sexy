import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { FunctionData, ScriptData } from 'js-yaml-loader!@/*';
import { IScriptCompiler } from './IScriptCompiler';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { ISharedFunctionCollection } from './Function/ISharedFunctionCollection';
import { IFunctionCallCompiler } from './FunctionCall/IFunctionCallCompiler';
import { FunctionCallCompiler } from './FunctionCall/FunctionCallCompiler';
import { IFunctionCompiler } from './Function/IFunctionCompiler';
import { FunctionCompiler } from './Function/FunctionCompiler';

export class ScriptCompiler implements IScriptCompiler {
    private readonly functions: ISharedFunctionCollection;
    constructor(
        functions: readonly FunctionData[] | undefined,
        private readonly syntax: ILanguageSyntax,
        functionCompiler: IFunctionCompiler = FunctionCompiler.instance,
        private readonly callCompiler: IFunctionCallCompiler = FunctionCallCompiler.instance,
        ) {
        if (!syntax) { throw new Error('undefined syntax'); }
        this.functions = functionCompiler.compileFunctions(functions);
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
            const compiledCode = this.callCompiler.compileCall(script.call, this.functions);
            return new ScriptCode(
                compiledCode.code,
                compiledCode.revertCode,
                this.syntax);
        } catch (error) {
            throw Error(`Script "${script.name}" ${error.message}`);
        }
    }
}
