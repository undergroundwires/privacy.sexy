import type { Documentable } from '@/domain/Executables/Documentable';
import type { Executable } from '../Executable';
import type { Script } from '../Script/Script';

<<<<<<< HEAD
export interface Category extends Executable {
=======
export interface Category extends Executable, Documentable {
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
  readonly name: string;
  readonly subcategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
  includes(script: Script): boolean;
  getAllScriptsRecursively(): ReadonlyArray<Script>;
}
