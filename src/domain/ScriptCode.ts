import { IScriptCode } from './IScriptCode';

export class ScriptCode implements IScriptCode {
    constructor(
        scriptName: string,
        public readonly execute: string,
        public readonly revert: string) {
        if (!scriptName) {
            throw new Error('script name is undefined');
        }
        validateCode(scriptName, execute);
        if (revert) {
            scriptName = `${scriptName} (revert)`;
            validateCode(scriptName, revert);
            if (execute === revert) {
                throw new Error(`${scriptName}: Code itself and its reverting code cannot be the same`);
            }
        }
    }
}

function validateCode(name: string, code: string): void {
    if (!code || code.length === 0) {
        throw new Error(`code of ${name} is empty or undefined`);
    }
    ensureNoEmptyLines(name, code);
    ensureCodeHasUniqueLines(name, code);
}

function ensureNoEmptyLines(name: string, code: string): void {
    if (code.split('\n').some((line) => line.trim().length === 0)) {
        throw Error(`script has empty lines "${name}"`);
    }
}

function ensureCodeHasUniqueLines(name: string, code: string): void {
    const lines = code.split('\n')
        .filter((line) => !shouldIgnoreLine(line));
    if (lines.length === 0) {
        return;
    }
    const duplicateLines = lines.filter((e, i, a) => a.indexOf(e) !== i);
    if (duplicateLines.length !== 0) {
        throw Error(`Duplicates detected in script "${name}":\n ${duplicateLines.join('\n')}`);
    }
}

function shouldIgnoreLine(codeLine: string): boolean {
    codeLine = codeLine.toLowerCase();
    const isCommentLine = () => codeLine.startsWith(':: ') || codeLine.startsWith('rem ');
    const consistsOfFrequentCommands = () => {
        const frequentCodeParts = [ '(', ')', 'else' ];
        const trimmed = codeLine.trim().split(' ');
        return trimmed.every((part) => frequentCodeParts.includes(part));
    };
    return isCommentLine() || consistsOfFrequentCommands();
}
