import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserScriptGenerator } from './IUserScriptGenerator';
import { CodeBuilder } from './CodeBuilder';
import { ICodePosition } from '@/application/State/Code/Position/ICodePosition';
import { CodePosition } from '../Position/CodePosition';
import { IUserScript } from './IUserScript';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ICodeBuilder } from './ICodeBuilder';

export class UserScriptGenerator implements IUserScriptGenerator {
    constructor(private readonly codeBuilderFactory: () => ICodeBuilder = () => new CodeBuilder()) {

    }
    public buildCode(
        selectedScripts: ReadonlyArray<SelectedScript>,
        scriptingDefinition: IScriptingDefinition): IUserScript {
        if (!selectedScripts) { throw new Error('undefined scripts'); }
        if (!scriptingDefinition) { throw new Error('undefined definition'); }
        let scriptPositions = new Map<SelectedScript, ICodePosition>();
        if (!selectedScripts.length) {
            return { code: '', scriptPositions };
        }
        let builder = this.codeBuilderFactory();
        builder = initializeCode(scriptingDefinition.startCode, builder);
        for (const selection of selectedScripts) {
            scriptPositions = appendSelection(selection, scriptPositions, builder);
        }
        const code = finalizeCode(builder, scriptingDefinition.endCode);
        return { code, scriptPositions };
    }
}

function initializeCode(startCode: string, builder: ICodeBuilder): ICodeBuilder {
    if (!startCode) {
        return builder;
    }
    return builder
        .appendLine(startCode)
        .appendLine();
}

function finalizeCode(builder: ICodeBuilder, endCode: string): string {
    if (!endCode) {
        return builder.toString();
    }
    return builder.appendLine()
        .appendLine(endCode)
        .toString();
}

function appendSelection(
    selection: SelectedScript,
    scriptPositions: Map<SelectedScript, ICodePosition>,
    builder: ICodeBuilder): Map<SelectedScript, ICodePosition> {
    const startPosition = builder.currentLine + 1;
    appendCode(selection, builder);
    const endPosition = builder.currentLine - 1;
    builder.appendLine();
    scriptPositions.set(selection, new CodePosition(startPosition, endPosition));
    return scriptPositions;
}

function appendCode(selection: SelectedScript, builder: ICodeBuilder) {
    const name = selection.revert ? `${selection.script.name} (revert)` : selection.script.name;
    const scriptCode = selection.revert ? selection.script.code.revert : selection.script.code.execute;
    builder.appendFunction(name, scriptCode);
}
