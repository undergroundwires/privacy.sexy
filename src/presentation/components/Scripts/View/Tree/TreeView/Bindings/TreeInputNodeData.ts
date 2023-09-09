export interface TreeInputNodeData {
  readonly id: string;
  readonly children?: readonly TreeInputNodeData[];
  readonly parent?: TreeInputNodeData | null;
  readonly data?: object;
}
