export type TreeInputNodeDataId = string;

export interface TreeInputNodeData {
  readonly id: TreeInputNodeDataId;
  readonly children?: readonly TreeInputNodeData[];
  readonly parent?: TreeInputNodeData | null;
  readonly data?: object;
}
