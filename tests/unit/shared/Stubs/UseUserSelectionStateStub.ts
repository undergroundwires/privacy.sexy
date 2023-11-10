import { shallowRef } from 'vue';
import type { SelectionModifier, useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { UserSelectionStub } from './UserSelectionStub';

export class UseUserSelectionStateStub
  extends StubWithObservableMethodCalls<ReturnType<typeof useUserSelectionState>> {
  private readonly currentSelection = shallowRef<IUserSelection>(
    new UserSelectionStub([]),
  );

  private modifyCurrentSelection(mutator: SelectionModifier) {
    mutator(this.currentSelection.value);
    this.registerMethodCall({
      methodName: 'modifyCurrentSelection',
      args: [mutator],
    });
  }

  public withUserSelection(userSelection: IUserSelection): this {
    this.currentSelection.value = userSelection;
    return this;
  }

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]): this {
    return this.withUserSelection(
      new UserSelectionStub(selectedScripts.map((s) => s.script))
        .withSelectedScripts(selectedScripts),
    );
  }

  public get selection(): IUserSelection {
    return this.currentSelection.value;
  }

  public isSelectionModified(): boolean {
    const modifyCall = this.callHistory.find((call) => call.methodName === 'modifyCurrentSelection');
    return modifyCall !== undefined;
  }

  public get(): ReturnType<typeof useUserSelectionState> {
    return {
      currentSelection: this.currentSelection,
      modifyCurrentSelection: this.modifyCurrentSelection.bind(this),
    };
  }
}
