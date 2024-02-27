import { EventSource } from '@/infrastructure/Events/EventSource';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ReadonlyScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { CodeChangedEvent } from './Event/CodeChangedEvent';
import { CodePosition } from './Position/CodePosition';
import { UserScriptGenerator } from './Generation/UserScriptGenerator';
import type { IUserScriptGenerator } from './Generation/IUserScriptGenerator';
import type { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import type { IApplicationCode } from './IApplicationCode';

export class ApplicationCode implements IApplicationCode {
  public readonly changed = new EventSource<ICodeChangedEvent>();

  public current: string;

  private scriptPositions = new Map<SelectedScript, CodePosition>();

  constructor(
    selection: ReadonlyScriptSelection,
    private readonly scriptingDefinition: IScriptingDefinition,
    private readonly generator: IUserScriptGenerator = new UserScriptGenerator(),
  ) {
    this.setCode(selection.selectedScripts);
    selection.changed.on((scripts) => {
      this.setCode(scripts);
    });
  }

  private setCode(scripts: ReadonlyArray<SelectedScript>): void {
    const oldScripts = Array.from(this.scriptPositions.keys());
    const code = this.generator.buildCode(scripts, this.scriptingDefinition);
    this.current = code.code;
    this.scriptPositions = code.scriptPositions;
    const event = new CodeChangedEvent(code.code, oldScripts, code.scriptPositions);
    this.changed.notify(event);
  }
}
