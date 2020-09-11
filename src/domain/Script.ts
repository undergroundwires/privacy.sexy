import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';

export class Script extends BaseEntity<string> implements IScript {
    constructor(
        public readonly name: string,
        public readonly code: string,
        public readonly revertCode: string,
        public readonly documentationUrls: ReadonlyArray<string>,
        public readonly isRecommended: boolean) {
        super(name);
        validateCode(name, code);
        if (revertCode) {
            validateCode(name, revertCode);
            if (code === revertCode) {
                throw new Error(`${name}: Code itself and its reverting code cannot be the same`);
            }
        }
    }
    public canRevert(): boolean {
        return Boolean(this.revertCode);
    }
}

function validateCode(name: string, code: string): void {
    if (!code || code.length === 0) {
        throw new Error(`Code of ${name} is empty or null`);
    }
    ensureCodeHasUniqueLines(name, code);
    ensureNoEmptyLines(name, code);
}

function ensureNoEmptyLines(name: string, code: string): void {
    if (code.split('\n').some((line) => line.trim().length === 0)) {
        throw Error(`Script has empty lines "${name}"`);
    }
}

function mayBeUniqueLine(codeLine: string): boolean {
    const trimmed = codeLine.trim();
    if (trimmed === ')' || trimmed === '(') { // "(" and ")" are used often in batch code
        return false;
    }
    if (codeLine.startsWith(':: ') || codeLine.startsWith('REM ')) { // Is comment?
        return false;
    }
    return true;
}

function ensureCodeHasUniqueLines(name: string, code: string): void {
    const lines = code.split('\n')
        .filter((line) => mayBeUniqueLine(line));
    if (lines.length === 0) {
        return;
    }
    const duplicateLines = lines.filter((e, i, a) => a.indexOf(e) !== i);
    if (duplicateLines.length !== 0) {
        throw Error(`Duplicates detected in script "${name}":\n ${duplicateLines.join('\n')}`);
    }
}
