import { RecommendationLevel } from './RecommendationLevel';
import type { ExecutableKey } from '../ExecutableKey/ExecutableKey';
import type { Script } from './Script';
import type { ScriptCode } from './Code/ScriptCode';

// TODO: Unit tests not done

export class CollectionScript implements Script {
  constructor(
    public readonly key: ExecutableKey,
    public readonly name: string,
    public readonly code: ScriptCode,
    public readonly docs: ReadonlyArray<string>,
    public readonly level?: RecommendationLevel,
  ) {
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
