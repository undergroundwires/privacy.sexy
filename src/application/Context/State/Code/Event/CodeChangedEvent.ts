import type { Script } from '@/domain/Executables/Script/Script';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { ICodeChangedEvent } from './ICodeChangedEvent';

export class CodeChangedEvent implements ICodeChangedEvent {
  public readonly code: string;

  public readonly addedScripts: ReadonlyArray<Script>;

  public readonly removedScripts: ReadonlyArray<Script>;

  public readonly changedScripts: ReadonlyArray<Script>;

  private readonly scripts: Map<Script, ICodePosition>;

  constructor(
    code: string,
    oldScripts: ReadonlyArray<SelectedScript>,
    scripts: Map<SelectedScript, ICodePosition>,
  ) {
    ensureAllPositionsExist(code, Array.from(scripts.values()));
    this.code = code;
    const newScripts = Array.from(scripts.keys());
    this.addedScripts = selectIfNotExists(newScripts, oldScripts);
    this.removedScripts = selectIfNotExists(oldScripts, newScripts);
    this.changedScripts = getChangedScripts(oldScripts, newScripts);
    this.scripts = new Map<Script, ICodePosition>();
    scripts.forEach((position, selection) => {
      this.scripts.set(selection.script, position);
    });
  }

  public isEmpty(): boolean {
    return this.scripts.size === 0;
  }

  public getScriptPositionInCode(script: Script): ICodePosition {
    return this.getPositionById(script.key);
  }

  private getPositionById(scriptKey: ExecutableKey): ICodePosition {
    const position = [...this.scripts.entries()]
      .filter(([s]) => s.key.equals(scriptKey))
      .map(([, pos]) => pos)
      .at(0);
    if (!position) {
      throw new Error('Unknown script: Position could not be found for the script');
    }
    return position;
  }
}

function ensureAllPositionsExist(script: string, positions: ReadonlyArray<ICodePosition>) {
  const totalLines = script.split(/\r\n|\r|\n/).length;
  const missingPositions = positions.filter((position) => position.endLine > totalLines);
  if (missingPositions.length > 0) {
    throw new Error(
      `Out of range script end line: "${missingPositions.map((pos) => pos.endLine).join('", "')}"`
        + `(total code lines: ${totalLines}).`,
    );
  }
}

function getChangedScripts(
  oldScripts: ReadonlyArray<SelectedScript>,
  newScripts: ReadonlyArray<SelectedScript>,
): ReadonlyArray<Script> {
  return newScripts
    .filter((newScript) => oldScripts.find((oldScript) => oldScript.key === newScript.key
      && oldScript.revert !== newScript.revert))
    .map((selection) => selection.script);
}

function selectIfNotExists(
  selectableContainer: ReadonlyArray<SelectedScript>,
  test: ReadonlyArray<SelectedScript>,
) {
  return selectableContainer
    .filter((script) => !test.find((oldScript) => oldScript.key === script.key))
    .map((selection) => selection.script);
}
