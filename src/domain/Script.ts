import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { RecommendationLevel } from './RecommendationLevel';
import type { IScript } from './IScript';
import type { IScriptCode } from './IScriptCode';

export class Script extends BaseEntity<string> implements IScript {
  public readonly name: string;

  public readonly code: IScriptCode;

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
  readonly code: IScriptCode;
  readonly docs: ReadonlyArray<string>;
  readonly level?: RecommendationLevel;
}

function validateLevel(level?: RecommendationLevel) {
  if (level !== undefined && !(level in RecommendationLevel)) {
    throw new Error(`invalid level: ${level}`);
  }
}
