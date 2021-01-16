export interface ISharedFunction {
    readonly name: string;
    readonly parameters?: readonly string[];
    readonly code: string;
    readonly revertCode?: string;
}
