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

  private state: CodeGenerationResult;

  public get current(): string {
    return this.state.code;
  }

  private get scriptPositions(): Map<SelectedScript, CodePosition> {
    return this.state.scriptPositions;
  }

  constructor(
    selection: ReadonlyScriptSelection,
    private readonly scriptingDefinition: IScriptingDefinition,
    private readonly generator: IUserScriptGenerator = new UserScriptGenerator(),
  ) {
    this.state = this.generateCode(selection.selectedScripts);
    selection.changed.on((newScripts) => {
      const oldScripts = Array.from(this.scriptPositions.keys());
      this.state = this.generateCode(newScripts);
      this.notifyCodeChange(oldScripts, this.state);
    });
  }

  private generateCode(scripts: readonly SelectedScript[]): CodeGenerationResult {
    const code = this.generator.buildCode(scripts, this.scriptingDefinition);
    return {
      code: code.code,
      scriptPositions: code.scriptPositions,
    };
  }

  private notifyCodeChange(
    oldScripts: readonly SelectedScript[],
    newCode: CodeGenerationResult,
  ): void {
    const event = new CodeChangedEvent(
      newCode.code,
      oldScripts,
      newCode.scriptPositions,
    );
    this.changed.notify(event);
  }
}

interface CodeGenerationResult {
  readonly code: string;
  readonly scriptPositions: Map<SelectedScript, CodePosition>;
}
