import { RecommendationLevel } from './RecommendationLevel';
import type { ExecutableKey } from '../ExecutableKey/ExecutableKey';
import type { Script } from './Script';
import type { ScriptCode } from './Code/ScriptCode';

export class CollectionScript implements Script {
  public readonly key: ExecutableKey;

  public readonly name: string;

  public readonly code: ScriptCode;

  public readonly docs: ReadonlyArray<string>;

  public readonly level?: RecommendationLevel;

  constructor(parameters: ScriptInitParameters) {
    this.name = parameters.name;
    this.code = parameters.code;
    this.docs = parameters.docs;
    this.level = parameters.level;
    this.key = parameters.key;
    validateLevel(parameters.level);
  }

  public canRevert(): boolean {
    return Boolean(this.code.revert);
  }
}

export interface ScriptInitParameters {
  readonly key: ExecutableKey;
  readonly name: string;
  readonly code: ScriptCode;
  readonly docs: ReadonlyArray<string>;
  readonly level?: RecommendationLevel;
}

function validateLevel(level?: RecommendationLevel) {
  if (level !== undefined && !(level in RecommendationLevel)) {
    throw new Error(`invalid level: ${level}`);
  }
}
