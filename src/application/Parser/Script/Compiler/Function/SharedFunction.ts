import { ISharedFunction } from './ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';

export class SharedFunction implements ISharedFunction {
    constructor(
        public readonly name: string,
        public readonly parameters: IReadOnlyFunctionParameterCollection,
        public readonly code: string,
        public readonly revertCode?: string,
        ) {
        if (!name) { throw new Error('undefined function name'); }
        if (!code) { throw new Error(`undefined function ("${name}") code`); }
        if (!parameters) { throw new Error(`undefined parameters`); }
    }
}
