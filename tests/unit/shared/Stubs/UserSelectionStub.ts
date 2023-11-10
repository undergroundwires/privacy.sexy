import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScript } from '@/domain/IScript';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { EventSourceStub } from './EventSourceStub';

export class UserSelectionStub
  extends StubWithObservableMethodCalls<IUserSelection>
  implements IUserSelection {
  public readonly changed = new EventSourceStub<readonly SelectedScript[]>();

  public selectedScripts: readonly SelectedScript[] = [];

  constructor(private readonly allScripts: readonly IScript[]) {
    super();
  }

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]): this {
    this.selectedScripts = selectedScripts;
    return this;
  }

  public triggerSelectionChangedEvent(scripts: readonly SelectedScript[]): this {
    this.changed.notify(scripts);
    return this;
  }

  public isScriptAdded(scriptId: string): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'addSelectedScript' && c.args[0] === scriptId,
    );
    return call !== undefined;
  }

  public isScriptRemoved(scriptId: string): boolean {
    const call = this.callHistory.find(
      (c) => c.methodName === 'removeSelectedScript' && c.args[0] === scriptId,
    );
    return call !== undefined;
  }

  public areAllSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public isAnySelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public removeAllInCategory(): void {
    throw new Error('Method not implemented.');
  }

  public addOrUpdateAllInCategory(): void {
    throw new Error('Method not implemented.');
  }

  public addSelectedScript(scriptId: string, revert: boolean): void {
    this.registerMethodCall({
      methodName: 'addSelectedScript',
      args: [scriptId, revert],
    });
  }

  public addOrUpdateSelectedScript(): void {
    throw new Error('Method not implemented.');
  }

  public removeSelectedScript(scriptId: string): void {
    this.registerMethodCall({
      methodName: 'removeSelectedScript',
      args: [scriptId],
    });
  }

  public selectOnly(scripts: ReadonlyArray<IScript>): void {
    this.selectedScripts = scripts.map((s) => new SelectedScript(s, false));
  }

  public isSelected(): boolean {
    throw new Error('Method not implemented.');
  }

  public selectAll(): void {
    this.selectOnly(this.allScripts);
  }

  public deselectAll(): void {
    this.selectedScripts = [];
  }
}
