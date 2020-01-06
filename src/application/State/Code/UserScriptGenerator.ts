import { CodeBuilder } from './CodeBuilder';
import { Script } from '@/domain/Script';

const adminRightsScript = {
    name: 'Ensure admin privileges',
    code: 'fltmc >nul 2>&1 || (\n' +
    '   echo This batch script requires administrator privileges. Right-click on\n' +
    '   echo the script and select "Run as administrator".\n' +
    '   pause\n' +
    '   exit 1\n' +
    ')',
};

export class UserScriptGenerator {
    public buildCode(scripts: ReadonlyArray<Script>, version: string): string {
        if (!scripts) { throw new Error('scripts is undefined'); }
        if (!scripts.length) { throw new Error('scripts are empty'); }
        if (!version) { throw new Error('version is undefined'); }
        const builder = new CodeBuilder()
            .appendLine('@echo off')
            .appendCommentLine(`https://privacy.sexy — v${version} — ${new Date().toUTCString()}`)
            .appendFunction(adminRightsScript.name, adminRightsScript.code).appendLine();
        for (const script of scripts) {
            builder.appendFunction(script.name, script.code).appendLine();
        }
        return builder.appendLine()
            .appendLine('pause')
            .appendLine('exit /b 0')
            .toString();
    }
}
