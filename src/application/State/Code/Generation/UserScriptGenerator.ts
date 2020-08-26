import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserScriptGenerator } from './IUserScriptGenerator';
import { CodeBuilder } from './CodeBuilder';
import { ICodePosition } from '@/application/State/Code/Position/ICodePosition';
import { CodePosition } from '../Position/CodePosition';
import { IUserScript } from './IUserScript';

export const adminRightsScript = {
    name: 'Ensure admin privileges',
    code: 'fltmc >nul 2>&1 || (\n' +
    '   echo echo Administrator privileges are required.\n' +
    '   PowerShell Start -Verb RunAs \'%~0\' 2> nul || (\n' +
    '       echo Right-click on the script and select "Run as administrator".\n' +
    '       pause & exit 1\n' +
    '   )\n' +
    '   exit 0\n' +
    ')',
};


export class UserScriptGenerator implements IUserScriptGenerator {
    public buildCode(selectedScripts: ReadonlyArray<SelectedScript>, version: string): IUserScript {
        if (!selectedScripts) { throw new Error('scripts is undefined'); }
        if (!version) { throw new Error('version is undefined'); }
        let scriptPositions = new Map<SelectedScript, ICodePosition>();
        if (!selectedScripts.length) {
            return { code: '', scriptPositions };
        }
        const builder = initializeCode(version);
        for (const selection of selectedScripts) {
            scriptPositions = appendSelection(selection, scriptPositions, builder);
        }
        const code = finalizeCode(builder);
        return { code, scriptPositions };
    }
}

function initializeCode(version: string): CodeBuilder {
    return new CodeBuilder()
        .appendLine('@echo off')
        .appendCommentLine(`https://privacy.sexy — v${version} — ${new Date().toUTCString()}`)
        .appendFunction(adminRightsScript.name, adminRightsScript.code)
        .appendLine();
}

function finalizeCode(builder: CodeBuilder): string {
    return builder.appendLine()
        .appendLine('pause')
        .appendLine('exit /b 0')
        .toString();
}

function appendSelection(
    selection: SelectedScript,
    scriptPositions: Map<SelectedScript, ICodePosition>,
    builder: CodeBuilder): Map<SelectedScript, ICodePosition> {
    const startPosition = builder.currentLine + 1;
    appendCode(selection, builder);
    const endPosition = builder.currentLine - 1;
    builder.appendLine();
    scriptPositions.set(selection, new CodePosition(startPosition, endPosition));
    return scriptPositions;
}

function appendCode(selection: SelectedScript, builder: CodeBuilder) {
    const name = selection.revert ? `${selection.script.name} (revert)` : selection.script.name;
    const scriptCode = selection.revert ? selection.script.revertCode : selection.script.code;
    builder.appendFunction(name, scriptCode);
}
