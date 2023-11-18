import { CategorySelection } from '@/application/Context/State/Selection/Category/CategorySelection';
import { CategorySelectionChangeCommand } from '@/application/Context/State/Selection/Category/CategorySelectionChange';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CategorySelectionStub
  extends StubWithObservableMethodCalls<CategorySelection>
  implements CategorySelection {
  public isCategorySelected(categoryId: number, revert: boolean): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'processChanges'
      && c.args[0].changes.some((change) => (
        change.newStatus.isSelected === true
        && change.newStatus.isReverted === revert
        && change.categoryId === categoryId)),
    );
    return call !== undefined;
  }

  public areAllScriptsSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public isAnyScriptSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public processChanges(action: CategorySelectionChangeCommand): void {
    this.registerMethodCall({
      methodName: 'processChanges',
      args: [action],
    });
  }
}
