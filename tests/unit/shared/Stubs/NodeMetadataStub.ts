import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { type NodeMetadata, NodeType } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';

export class NodeMetadataStub implements NodeMetadata {
  public executableId: ExecutableId = 'stub-id';

  public readonly text: string = 'stub-text';

  public readonly isReversible: boolean = false;

  public readonly docs: readonly string[] = [];

  public children: readonly NodeMetadata[] = [];

  public readonly type: NodeType = NodeType.Category;

  public withChildren(children: readonly NodeMetadata[]): this {
    this.children = children;
    return this;
  }

  public withId(executableId: ExecutableId): this {
    this.executableId = executableId;
    return this;
  }
}
