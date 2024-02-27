import { TreeNodeCheckState } from './CheckState';
import type { TreeNodeStateTransaction } from './StateAccess';
import type { TreeNodeStateDescriptor } from './StateDescriptor';

export class TreeNodeStateTransactionDescriber implements TreeNodeStateTransaction {
  constructor(public updatedState: Partial<TreeNodeStateDescriptor> = {}) { }

  public withExpansionState(isExpanded: boolean): TreeNodeStateTransaction {
    return this.describeChange({
      isExpanded,
    });
  }

  public withMatchState(isMatched: boolean): TreeNodeStateTransaction {
    return this.describeChange({
      isMatched,
    });
  }

  public withFocusState(isFocused: boolean): TreeNodeStateTransaction {
    return this.describeChange({
      isFocused,
    });
  }

  public withVisibilityState(isVisible: boolean): TreeNodeStateTransaction {
    return this.describeChange({
      isVisible,
    });
  }

  public withCheckState(checkState: TreeNodeCheckState): TreeNodeStateTransaction {
    return this.describeChange({
      checkState,
    });
  }

  private describeChange(changedState: Partial<TreeNodeStateDescriptor>): TreeNodeStateTransaction {
    return new TreeNodeStateTransactionDescriber({
      ...this.updatedState,
      ...changedState,
    });
  }
}
