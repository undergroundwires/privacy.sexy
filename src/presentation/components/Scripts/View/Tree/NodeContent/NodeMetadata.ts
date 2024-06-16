import type { ExecutableId } from '@/domain/Executables/Identifiable';

export enum NodeType {
  Script,
  Category,
}

export interface NodeMetadata {
  readonly id: ExecutableId;
  readonly text: string;
  readonly isReversible: boolean;
  readonly docs: ReadonlyArray<string>;
  readonly children: ReadonlyArray<NodeMetadata>;
  readonly type: NodeType;
}
