import { ICodePosition } from './ICodePosition';

export class CodePosition implements ICodePosition {
    public get totalLines(): number {
        return this.endLine - this.startLine;
    }

    constructor(
        public readonly startLine: number,
        public readonly endLine: number) {
        if (startLine < 0) {
            throw new Error('Code cannot start in a negative line');
        }
        if (endLine < 0) {
            throw new Error('Code cannot end in a negative line');
        }
        if (endLine === startLine) {
            throw new Error('Empty code');
        }
        if (endLine < startLine) {
            throw new Error('End line cannot be less than start line');
        }
    }
}
