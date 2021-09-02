import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';

export interface ISharedFunction {
    readonly name: string;
    readonly parameters: IReadOnlyFunctionParameterCollection;
    readonly code: string;
    readonly revertCode?: string;
}
