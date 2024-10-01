import { expect } from 'vitest';
import type { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ScriptSelectionChange, ScriptSelectionChangeCommand } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
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

  public isScriptSelected(scriptExecutableId: ExecutableId, revert: boolean): boolean {
    return this.isScriptChanged({
      scriptId: scriptExecutableId,
      newStatus: {
        isSelected: true,
        isReverted: revert,
      },
    });
  }

  public isScriptDeselected(scriptExecutableId: ExecutableId): boolean {
    return this.isScriptChanged({
      scriptId: scriptExecutableId,
      newStatus: {
        isSelected: false,
      },
    });
  }

  public processChanges(action: ScriptSelectionChangeCommand): void {
    this.registerMethodCall({
      methodName: 'processChanges',
      args: [action],
    });
  }

  public selectOnly(scripts: ReadonlyArray<Script>): void {
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

  public assertSelectionChanges(expectedChanges: readonly ScriptSelectionChange[]): void {
    const actualChanges = this.getAllChanges();
    expect(actualChanges).to.have.lengthOf(expectedChanges.length, formatAssertionMessage([
      `Expected number of changes to be ${expectedChanges.length}, but found ${actualChanges.length}`,
      `Expected changes (${expectedChanges.length}):`, toNumberedPrettyJson(expectedChanges),
      `Actual changes (${actualChanges.length}):`, toNumberedPrettyJson(actualChanges),
    ]));
    const unexpectedChanges = actualChanges.filter(
      (actual) => !expectedChanges.some((expected) => isSameChange(actual, expected)),
    );
    expect(unexpectedChanges).to.have.lengthOf(0, formatAssertionMessage([
      `Found ${unexpectedChanges.length} unexpected changes.`,
      'Unexpected changes:', toNumberedPrettyJson(unexpectedChanges),
      'Expected changes:', toNumberedPrettyJson(expectedChanges),
      'Actual changes:', toNumberedPrettyJson(actualChanges),
    ]));
  }

  private isScriptChanged(expectedChange: ScriptSelectionChange): boolean {
    return this.getAllChanges().some((change) => isSameChange(change, expectedChange));
  }

  private getAllChanges(): ScriptSelectionChange[] {
    const processChangesCalls = this.callHistory.filter((c) => c.methodName === 'processChanges');
    const changeCommands = processChangesCalls.map(
      (call) => call.args[0] as ScriptSelectionChangeCommand,
    );
    const changes = changeCommands.flatMap((command) => command.changes);
    return changes;
  }
}

function isSameChange(change: ScriptSelectionChange, otherChange: ScriptSelectionChange): boolean {
  return change.newStatus.isSelected === otherChange.newStatus.isSelected
    && change.newStatus.isReverted === otherChange.newStatus.isReverted
    && change.scriptId === otherChange.scriptId;
}

function toNumberedPrettyJson<T>(array: readonly T[]): string {
  return array.map((item, index) => `${index + 1}: ${JSON.stringify(item, undefined, 2)}`).join('\n');
}
