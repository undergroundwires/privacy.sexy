export interface INode {
    readonly id: string;
    readonly text: string;
    readonly isReversible: boolean;
    readonly documentationUrls: ReadonlyArray<string>;
    readonly children?: ReadonlyArray<INode>;
}
