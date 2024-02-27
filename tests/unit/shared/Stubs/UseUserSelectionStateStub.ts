import { shallowRef } from 'vue';
import type { SelectionModifier, useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { UserSelectionStub } from './UserSelectionStub';
import { ScriptSelectionStub } from './ScriptSelectionStub';

export class UseUserSelectionStateStub
  extends StubWithObservableMethodCalls<ReturnType<typeof useUserSelectionState>> {
  private readonly currentSelection = shallowRef<UserSelection>(
    new UserSelectionStub(),
  );

  private modifyCurrentSelection(mutator: SelectionModifier) {
    mutator(this.currentSelection.value);
    this.registerMethodCall({
      methodName: 'modifyCurrentSelection',
      args: [mutator],
    });
  }

  public withUserSelection(userSelection: UserSelection): this {
    this.currentSelection.value = userSelection;
    return this;
  }

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]): this {
    return this.withUserSelection(
      new UserSelectionStub()
        .withScripts(
          new ScriptSelectionStub().withSelectedScripts(selectedScripts),
        ),
    );
  }

  public get selection(): UserSelection {
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
