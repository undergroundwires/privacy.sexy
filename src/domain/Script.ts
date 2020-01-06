import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';

export class Script extends BaseEntity<string> implements IScript {
    private static ensureNoEmptyLines(name: string, code: string): void {
        if (code.split('\n').some((line) => line.trim().length === 0)) {
            throw Error(`Script has empty lines "${name}"`);
        }
    }

    private static ensureCodeHasUniqueLines(name: string, code: string): void {
        const lines = code.split('\n')
            .filter((line) => this.mayBeUniqueLine(line));
        if (lines.length === 0) {
            return;
        }
        const duplicateLines = lines.filter((e, i, a) => a.indexOf(e) !== i);
        if (duplicateLines.length !== 0) {
            throw Error(`Duplicates detected in script "${name}":\n ${duplicateLines.join('\n')}`);
        }
    }

    private static mayBeUniqueLine(codeLine: string): boolean {
        const trimmed = codeLine.trim();
        if (trimmed === ')' || trimmed === '(') { // "(" and ")" are used often in batch code
            return false;
        }
        return true;
    }

    constructor(public name: string, public code: string, public documentationUrls: ReadonlyArray<string>) {
        super(name);
        if (code == null || code.length === 0) {
            throw new Error('Code is empty or null');
        }
        Script.ensureCodeHasUniqueLines(name, code);
        Script.ensureNoEmptyLines(name, code);
    }
}

export { IScript } from './IScript';
