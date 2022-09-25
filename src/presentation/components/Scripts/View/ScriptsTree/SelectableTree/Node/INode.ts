export enum NodeType {
  Script,
  Category,
}

export interface INode {
  readonly id: string;
  readonly text: string;
  readonly isReversible: boolean;
  readonly docs: ReadonlyArray<string>;
  readonly children?: ReadonlyArray<INode>;
  readonly type: NodeType;
}
