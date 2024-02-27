import { RecommendationLevel } from './RecommendationLevel';
import type { IEntity } from '../infrastructure/Entity/IEntity';
import type { IDocumentable } from './IDocumentable';
import type { IScriptCode } from './IScriptCode';

export interface IScript extends IEntity<string>, IDocumentable {
  readonly name: string;
  readonly level?: RecommendationLevel;
  readonly docs: ReadonlyArray<string>;
  readonly code: IScriptCode;
  canRevert(): boolean;
}
