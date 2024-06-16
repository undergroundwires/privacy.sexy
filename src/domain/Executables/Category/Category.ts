import type { Script } from '../Script/Script';
import type { Executable } from '../Executable';

export interface Category extends Executable {
  readonly name: string;
  readonly subcategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
  includes(script: Script): boolean;
  getAllScriptsRecursively(): ReadonlyArray<Script>;
}
