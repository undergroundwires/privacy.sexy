import { IScriptCode } from './IScriptCode';

export class ScriptCode implements IScriptCode {
    constructor(
        public readonly execute: string,
        public readonly revert: string,
        syntax: ILanguageSyntax) {
        if (!syntax) { throw new Error('undefined syntax'); }
        validateCode(execute, syntax);
        if (revert) {
            try {
                validateCode(revert, syntax);
                if (execute === revert) {
                    throw new Error(`Code itself and its reverting code cannot be the same`);
                }
            } catch (err) {
                throw Error(`(revert): ${err.message}`);
            }
        }
    }
}

export interface ILanguageSyntax {
    readonly commentDelimiters: string[];
    readonly commonCodeParts: string[];
}

function validateCode(code: string, syntax: ILanguageSyntax): void {
    if (!code || code.length === 0) {
        throw new Error(`code is empty or undefined`);
    }
    ensureNoEmptyLines(code);
    ensureCodeHasUniqueLines(code, syntax);
}

function ensureNoEmptyLines(code: string): void {
    if (code.split('\n').some((line) => line.trim().length === 0)) {
        throw Error(`script has empty lines`);
    }
}

function ensureCodeHasUniqueLines(code: string, syntax: ILanguageSyntax): void {
    const lines = code.split('\n')
        .filter((line) => !shouldIgnoreLine(line, syntax));
    if (lines.length === 0) {
        return;
    }
    const duplicateLines = lines.filter((e, i, a) => a.indexOf(e) !== i);
    if (duplicateLines.length !== 0) {
        throw Error(`Duplicates detected in script :\n ${duplicateLines.join('\n')}`);
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
