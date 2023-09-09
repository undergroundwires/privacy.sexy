import { TreeNodeCheckState } from './CheckState';

export interface TreeNodeStateDescriptor {
  readonly checkState: TreeNodeCheckState;
  readonly isExpanded: boolean;
  readonly isVisible: boolean;
  readonly isMatched: boolean;
  readonly isFocused: boolean;
}
