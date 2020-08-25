import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserScriptGenerator } from './IUserScriptGenerator';
import { CodeBuilder } from './CodeBuilder';

export const adminRightsScript = {
    name: 'Ensure admin privileges',
    code: 'fltmc >nul 2>&1 || (\n' +
    '   echo This batch script requires administrator privileges. Right-click on\n' +
    '   echo the script and select "Run as administrator".\n' +
    '   pause\n' +
    '   exit 1\n' +
    ')',
};

export class UserScriptGenerator implements IUserScriptGenerator {
    public buildCode(selectedScripts: ReadonlyArray<SelectedScript>, version: string): string {
        if (!selectedScripts) { throw new Error('scripts is undefined'); }
        if (!selectedScripts.length) { throw new Error('scripts are empty'); }
        if (!version) { throw new Error('version is undefined'); }
        const builder = new CodeBuilder()
            .appendLine('@echo off')
            .appendCommentLine(`https://privacy.sexy — v${version} — ${new Date().toUTCString()}`)
            .appendFunction(adminRightsScript.name, adminRightsScript.code).appendLine();
        for (const selection of selectedScripts) {
            const name = selection.revert ? `${selection.script.name} (revert)` : selection.script.name;
            const code = selection.revert ? selection.script.revertCode : selection.script.code;
            builder.appendFunction(name, code).appendLine();
        }
        return builder.appendLine()
            .appendLine('pause')
            .appendLine('exit /b 0')
            .toString();
    }
}
