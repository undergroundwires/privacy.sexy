import type { Documentable } from '@/domain/Executables/Documentable';
import type { Executable } from '../Executable';
import type { Script } from '../Script/Script';

export interface Category extends Executable, Documentable {
  readonly name: string;
  readonly subCategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
  includes(script: Script): boolean;
  getAllScriptsRecursively(): ReadonlyArray<Script>;
}
