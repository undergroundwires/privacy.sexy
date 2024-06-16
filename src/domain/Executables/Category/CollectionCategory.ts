import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableKey } from '../ExecutableKey/ExecutableKey';
import type { Category } from './Category';

export class CollectionCategory implements Category {
  public readonly key: ExecutableKey;

  public readonly name: string;

  public readonly docs: ReadonlyArray<string>;

  public readonly subcategories: ReadonlyArray<Category>;

  public readonly scripts: ReadonlyArray<Script>;

  private allSubScripts?: ReadonlyArray<Script> = undefined;

  constructor(parameters: CategoryInitParameters) {
    validateParameters(parameters);
    this.key = parameters.key;
    this.name = parameters.name;
    this.docs = parameters.docs;
    this.subcategories = parameters.subcategories;
    this.scripts = parameters.scripts;
  }

  public includes(script: Script): boolean {
    return this.getAllScriptsRecursively().some((childScript) => childScript.key === script.key);
  }

  public getAllScriptsRecursively(): readonly Script[] {
    if (!this.allSubScripts) {
      this.allSubScripts = parseScriptsRecursively(this);
    }
    return this.allSubScripts;
  }
}

export interface CategoryInitParameters {
  readonly key: ExecutableKey;
  readonly name: string;
  readonly docs: ReadonlyArray<string>;
  readonly subcategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
}

function parseScriptsRecursively(category: Category): ReadonlyArray<Script> {
  return [
    ...category.scripts,
    ...category.subcategories.flatMap((c) => c.getAllScriptsRecursively()),
  ];
}

function validateParameters(parameters: CategoryInitParameters) {
  if (!parameters.name) {
    throw new Error('missing name');
  }
  if (parameters.subcategories.length === 0 && parameters.scripts.length === 0) {
    throw new Error('A category must have at least one sub-category or script');
  }
}
