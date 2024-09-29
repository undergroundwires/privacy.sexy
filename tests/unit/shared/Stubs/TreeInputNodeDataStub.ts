import type { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import type { TreeNodeId } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';

export class TreeInputNodeDataStub implements TreeInputNodeData {
  public id: TreeNodeId = 'stub-id';

  public children?: readonly TreeInputNodeData[];

  public parent?: TreeInputNodeData;

  public data?: object;

  public withData(data: object): this {
    this.data = data;
    return this;
  }

  public withId(id: TreeNodeId): this {
    this.id = id;
    return this;
  }

  public withChildren(children: readonly TreeInputNodeData[]): this {
    this.children = children;
    return this;
  }
}
