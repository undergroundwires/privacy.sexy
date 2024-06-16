import { RecommendationLevel } from './RecommendationLevel';
import type { Documentable } from '../Documentable';
import type { Executable } from '../Executable';
import type { ScriptCode } from './Code/ScriptCode';

export interface Script extends Executable, Documentable {
  readonly name: string;
  readonly level?: RecommendationLevel;
  readonly docs: ReadonlyArray<string>;
  readonly code: ScriptCode;
  canRevert(): boolean;
}
