import { RecommendationLevel } from './RecommendationLevel';
<<<<<<< HEAD:src/domain/Executables/Script/ScriptFactory.ts
=======
import type { ExecutableKey } from '../ExecutableKey/ExecutableKey';
import type { Script } from './Script';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126):src/domain/Executables/Script/CollectionScript.ts
import type { ScriptCode } from './Code/ScriptCode';
import type { Script } from './Script';

export interface ScriptInitParameters {
  readonly executableId: string;
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
  public readonly executableId: string;

<<<<<<< HEAD:src/domain/Executables/Script/ScriptFactory.ts
=======
export class CollectionScript implements Script {
  public readonly key: ExecutableKey;

>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126):src/domain/Executables/Script/CollectionScript.ts
  public readonly name: string;

  public readonly code: ScriptCode;

  public readonly docs: ReadonlyArray<string>;

  public readonly level?: RecommendationLevel;

  constructor(parameters: ScriptInitParameters) {
<<<<<<< HEAD:src/domain/Executables/Script/ScriptFactory.ts
    this.executableId = parameters.executableId;
=======
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126):src/domain/Executables/Script/CollectionScript.ts
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

<<<<<<< HEAD:src/domain/Executables/Script/ScriptFactory.ts
=======
export interface ScriptInitParameters {
  readonly key: ExecutableKey;
  readonly name: string;
  readonly code: ScriptCode;
  readonly docs: ReadonlyArray<string>;
  readonly level?: RecommendationLevel;
}

>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126):src/domain/Executables/Script/CollectionScript.ts
function validateLevel(level?: RecommendationLevel) {
  if (level !== undefined && !(level in RecommendationLevel)) {
    throw new Error(`invalid level: ${level}`);
  }
}
