import { IScriptCode } from './IScriptCode';

export class ScriptCode implements IScriptCode {
    constructor(
        public readonly execute: string,
        public readonly revert: string,
        scriptName: string,
        syntax: ILanguageSyntax) {
        if (!scriptName)    {   throw new Error('script name is undefined');    }
        if (!syntax)        {   throw new Error('syntax is undefined');         }
        validateCode(scriptName, execute, syntax);
        if (revert) {
            scriptName = `${scriptName} (revert)`;
            validateCode(scriptName, revert, syntax);
            if (execute === revert) {
                throw new Error(`${scriptName}: Code itself and its reverting code cannot be the same`);
            }
        }
    }
}

export interface ILanguageSyntax {
    readonly commentDelimiters: string[];
    readonly commonCodeParts: string[];
}

function validateCode(name: string, code: string, syntax: ILanguageSyntax): void {
    if (!code || code.length === 0) {
        throw new Error(`code of ${name} is empty or undefined`);
    }
    ensureNoEmptyLines(name, code);
    ensureCodeHasUniqueLines(name, code, syntax);
}

function ensureNoEmptyLines(name: string, code: string): void {
    if (code.split('\n').some((line) => line.trim().length === 0)) {
        throw Error(`script has empty lines "${name}"`);
    }
}

function ensureCodeHasUniqueLines(name: string, code: string, syntax: ILanguageSyntax): void {
    const lines = code.split('\n')
        .filter((line) => !shouldIgnoreLine(line, syntax));
    if (lines.length === 0) {
        return;
    }
    const duplicateLines = lines.filter((e, i, a) => a.indexOf(e) !== i);
    if (duplicateLines.length !== 0) {
        throw Error(`Duplicates detected in script "${name}":\n ${duplicateLines.join('\n')}`);
    }
}

function shouldIgnoreLine(codeLine: string, syntax: ILanguageSyntax): boolean {
    codeLine = codeLine.toLowerCase();
    const isCommentLine = () => syntax.commentDelimiters.some((delimiter) => codeLine.startsWith(delimiter));
    const consistsOfFrequentCommands = () => {
        const trimmed = codeLine.trim().split(' ');
        return trimmed.every((part) => syntax.commonCodeParts.includes(part));
    };
    return isCommentLine() || consistsOfFrequentCommands();
}
