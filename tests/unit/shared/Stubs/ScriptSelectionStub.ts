import { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { IScript } from '@/domain/IScript';
import { ScriptSelectionChangeCommand } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { EventSourceStub } from './EventSourceStub';
import { SelectedScriptStub } from './SelectedScriptStub';

export class ScriptSelectionStub
  extends StubWithObservableMethodCalls<ScriptSelection>
  implements ScriptSelection {
  public readonly changed = new EventSourceStub<readonly SelectedScript[]>();

  public selectedScripts: readonly SelectedScript[] = [];

  public isSelectedResult: boolean | undefined;

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]): this {
    this.selectedScripts = selectedScripts;
    return this;
  }

  public triggerSelectionChangedEvent(scripts: readonly SelectedScript[]): this {
    this.changed.notify(scripts);
    return this;
  }

  public withIsSelectedResult(isSelected: boolean): this {
    this.isSelectedResult = isSelected;
    return this;
  }

  public isScriptSelected(scriptId: string, revert: boolean): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'processChanges'
      && c.args[0].changes.some((change) => (
        change.newStatus.isSelected === true
        && change.newStatus.isReverted === revert
        && change.scriptId === scriptId)),
    );
    return call !== undefined;
  }

  public isScriptDeselected(scriptId: string): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'processChanges'
      && c.args[0].changes.some((change) => (
        change.newStatus.isSelected === false
        && change.scriptId === scriptId)),
    );
    return call !== undefined;
  }

  public processChanges(action: ScriptSelectionChangeCommand): void {
    this.registerMethodCall({
      methodName: 'processChanges',
      args: [action],
    });
  }

  public selectOnly(scripts: ReadonlyArray<IScript>): void {
    this.registerMethodCall({
      methodName: 'selectOnly',
      args: [scripts],
    });
    this.selectedScripts = scripts.map((s) => new SelectedScriptStub(s));
  }

  public selectAll(): void {
    this.registerMethodCall({
      methodName: 'selectAll',
      args: [],
    });
  }

  public deselectAll(): void {
    this.registerMethodCall({
      methodName: 'deselectAll',
      args: [],
    });
  }

  public isSelected(): boolean {
    if (this.isSelectedResult === undefined) {
      throw new Error('Method not configured.');
    }
    return this.isSelectedResult;
  }
}
