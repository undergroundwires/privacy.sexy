import type { CategorySelection } from '@/application/Context/State/Selection/Category/CategorySelection';
import type { CategorySelectionChangeCommand } from '@/application/Context/State/Selection/Category/CategorySelectionChange';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CategorySelectionStub
  extends StubWithObservableMethodCalls<CategorySelection>
  implements CategorySelection {
  public isCategorySelected(categoryKey: ExecutableKey, revert: boolean): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'processChanges'
      && c.args[0].changes.some((change) => (
        change.newStatus.isSelected === true
        && change.newStatus.isReverted === revert
        && change.categoryKey.equals(categoryKey))),
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
