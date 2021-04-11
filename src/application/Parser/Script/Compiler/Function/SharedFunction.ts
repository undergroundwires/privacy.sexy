import { ISharedFunction } from './ISharedFunction';

export class SharedFunction implements ISharedFunction {
    public readonly parameters: readonly string[];
    constructor(
        public readonly name: string,
        parameters: readonly string[],
        public readonly code: string,
        public readonly revertCode: string,
        ) {
        if (!name) { throw new Error('undefined function name'); }
        if (!code) { throw new Error(`undefined function ("${name}") code`); }
        this.parameters = parameters || [];
    }
}
