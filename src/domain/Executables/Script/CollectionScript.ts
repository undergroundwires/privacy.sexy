import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { RecommendationLevel } from './RecommendationLevel';
import type { Script } from './Script';
import type { ScriptCode } from './Code/ScriptCode';

export class CollectionScript extends BaseEntity<string> implements Script {
  public readonly name: string;

  public readonly code: ScriptCode;

  public readonly docs: ReadonlyArray<string>;

  public readonly level?: RecommendationLevel;

  constructor(parameters: ScriptInitParameters) {
    super(parameters.name);
    this.name = parameters.name;
    this.code = parameters.code;
    this.docs = parameters.docs;
    this.level = parameters.level;
    validateLevel(parameters.level);
  }

  public canRevert(): boolean {
    return Boolean(this.code.revert);
  }
}

export interface ScriptInitParameters {
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
