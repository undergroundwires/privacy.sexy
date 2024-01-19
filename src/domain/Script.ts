import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { IScript } from './IScript';
import { RecommendationLevel } from './RecommendationLevel';
import { IScriptCode } from './IScriptCode';

export class Script extends BaseEntity<string> implements IScript {
  constructor(
    public readonly name: string,
    public readonly code: IScriptCode,
    public readonly docs: ReadonlyArray<string>,
    public readonly level?: RecommendationLevel,
  ) {
    super(name);
    validateLevel(level);
  }

  public canRevert(): boolean {
    return Boolean(this.code.revert);
  }
}

function validateLevel(level?: RecommendationLevel) {
  if (level !== undefined && !(level in RecommendationLevel)) {
    throw new Error(`invalid level: ${level}`);
  }
}
