export interface INode {
    readonly id: string;
    readonly text: string;
    readonly documentationUrls: ReadonlyArray<string>;
    readonly children?: ReadonlyArray<INode>;
    readonly selected: boolean;
}
