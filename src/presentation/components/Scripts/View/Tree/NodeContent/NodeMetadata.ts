export enum NodeType {
  Script,
  Category,
}

export interface NodeMetadata {
  readonly id: string;
  readonly text: string;
  readonly isReversible: boolean;
  readonly docs: ReadonlyArray<string>;
  readonly children: ReadonlyArray<NodeMetadata>;
  readonly type: NodeType;
}
