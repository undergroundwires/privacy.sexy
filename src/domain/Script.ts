import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';

export class Script extends BaseEntity<string> implements IScript {
    private static ensureNoEmptyLines(name: string, code: string): void {
        if (code.split('\n').some((line) => line.trim().length === 0)) {
            throw Error(`Script has empty lines "${name}"`);
        }
    }

    private static ensureCodeHasUniqueLines(name: string, code: string): void {
        const lines = code.split('\n');
        if (lines.length === 0) {
            return;
        }
        const checkForDuplicates = (line: string) => {
            const trimmed = line.trim();
            if (trimmed.length === 1 && trimmed === ')' || trimmed === '(') {
                return false;
            }
            return true;
        };
        const duplicateLines = new Array<string>();
        const uniqueLines = new Set<string>();
        let validatedLineCount = 0;
        for (const line of lines) {
            if (!checkForDuplicates(line)) {
                continue;
            }
            uniqueLines.add(line);
            if (uniqueLines.size !== validatedLineCount + 1) {
                duplicateLines.push(line);
            }
            validatedLineCount++;
        }
        if (duplicateLines.length !== 0) {
            throw Error(`Duplicates detected in script "${name}":\n ${duplicateLines.join('\n')}`);
        }
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
