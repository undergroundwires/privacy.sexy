import { TreeNodeCheckState } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/CheckState';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';

export class TreeNodeStateDescriptorStub implements TreeNodeStateDescriptor {
  public checkState: TreeNodeCheckState = TreeNodeCheckState.Checked;

  public isExpanded = false;

  public isVisible = false;

  public isMatched = false;

  public isFocused = false;

  public withFocus(isFocused: boolean): this {
    this.isFocused = isFocused;
    return this;
  }

  public withCheckState(checkState: TreeNodeCheckState): this {
    this.checkState = checkState;
    return this;
  }

  public withVisibility(isVisible: boolean): this {
    this.isVisible = isVisible;
    return this;
  }
}
