import type { Script } from '@/domain/Executables/Script/Script';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';

export interface ICodeChangedEvent {
  readonly code: string;
  readonly addedScripts: ReadonlyArray<Script>;
  readonly removedScripts: ReadonlyArray<Script>;
  readonly changedScripts: ReadonlyArray<Script>;
  isEmpty(): boolean;
  getScriptPositionInCode(script: Script): ICodePosition;
}
