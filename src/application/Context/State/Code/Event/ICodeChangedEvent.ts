import { IScript } from '@/domain/IScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';

export interface ICodeChangedEvent {
  readonly code: string;
  readonly addedScripts: ReadonlyArray<IScript>;
  readonly removedScripts: ReadonlyArray<IScript>;
  readonly changedScripts: ReadonlyArray<IScript>;
  isEmpty(): boolean;
  getScriptPositionInCode(script: IScript): ICodePosition;
}
