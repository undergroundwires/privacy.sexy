import { IScript } from '@/domain/IScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { SelectedScript } from '../../Selection/SelectedScript';
import { ICodeChangedEvent } from './ICodeChangedEvent';

export class CodeChangedEvent implements ICodeChangedEvent {
  public readonly code: string;

  public readonly addedScripts: ReadonlyArray<IScript>;

  public readonly removedScripts: ReadonlyArray<IScript>;

  public readonly changedScripts: ReadonlyArray<IScript>;

  private readonly scripts: Map<IScript, ICodePosition>;

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
    this.scripts = new Map<IScript, ICodePosition>();
    scripts.forEach((position, selection) => {
      this.scripts.set(selection.script, position);
    });
  }

  public isEmpty(): boolean {
    return this.scripts.size === 0;
  }

  public getScriptPositionInCode(script: IScript): ICodePosition {
    return this.scripts.get(script);
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
): ReadonlyArray<IScript> {
  return newScripts
    .filter((newScript) => oldScripts.find((oldScript) => oldScript.id === newScript.id
      && oldScript.revert !== newScript.revert))
    .map((selection) => selection.script);
}

function selectIfNotExists(
  selectableContainer: ReadonlyArray<SelectedScript>,
  test: ReadonlyArray<SelectedScript>,
) {
  return selectableContainer
    .filter((script) => !test.find((oldScript) => oldScript.id === script.id))
    .map((selection) => selection.script);
}
