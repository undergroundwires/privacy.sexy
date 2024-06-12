import type { Script } from '../Script/Script';
import type { Executable } from '../Executable';

export interface Category extends Executable<number> {
  readonly id: number;
  readonly name: string;
  readonly subCategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
  includes(script: Script): boolean;
  getAllScriptsRecursively(): ReadonlyArray<Script>;
}
