import { RecommendationLevel } from './RecommendationLevel';
import type { ScriptCode } from './Code/ScriptCode';
import type { Script } from './Script';
import type { ExecutableId } from '../Identifiable';

export interface ScriptInitParameters {
  readonly executableId: ExecutableId;
  readonly name: string;
  readonly code: ScriptCode;
  readonly docs: ReadonlyArray<string>;
  readonly level?: RecommendationLevel;
}

export type ScriptFactory = (
  parameters: ScriptInitParameters,
) => Script;

export const createScript: ScriptFactory = (parameters) => {
  return new CollectionScript(parameters);
};

class CollectionScript implements Script {
  public readonly executableId: ExecutableId;

  public readonly name: string;

  public readonly code: ScriptCode;

  public readonly docs: ReadonlyArray<string>;

  public readonly level?: RecommendationLevel;

  constructor(parameters: ScriptInitParameters) {
    this.executableId = parameters.executableId;
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

function validateLevel(level?: RecommendationLevel) {
  if (level !== undefined && !(level in RecommendationLevel)) {
    throw new Error(`invalid level: ${level}`);
  }
}
