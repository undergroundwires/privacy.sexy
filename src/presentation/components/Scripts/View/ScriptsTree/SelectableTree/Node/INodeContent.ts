export enum NodeType {
  Script,
  Category,
}

export interface INodeContent {
  readonly id: string;
  readonly text: string;
  readonly isReversible: boolean;
  readonly docs: ReadonlyArray<string>;
  readonly children?: ReadonlyArray<INodeContent>;
  readonly type: NodeType;
}
