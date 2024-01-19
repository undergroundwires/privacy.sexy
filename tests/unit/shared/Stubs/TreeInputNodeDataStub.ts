import { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';

export class TreeInputNodeDataStub implements TreeInputNodeData {
  public id = 'stub-id';

  public children?: readonly TreeInputNodeData[];

  public parent?: TreeInputNodeData;

  public data?: object;

  public withData(data: object): this {
    this.data = data;
    return this;
  }

  public withId(id: string): this {
    this.id = id;
    return this;
  }

  public withChildren(children: readonly TreeInputNodeData[]): this {
    this.children = children;
    return this;
  }
}
