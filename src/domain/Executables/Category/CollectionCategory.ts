import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableKey } from '../ExecutableKey/ExecutableKey';
import type { Category } from './Category';

export class CollectionCategory implements Category {
  private allSubScripts?: ReadonlyArray<Script> = undefined;

  constructor(
    public readonly key: ExecutableKey,
    public readonly name: string,
    public readonly docs: ReadonlyArray<string>,
    public readonly subCategories: ReadonlyArray<Category>,
    public readonly scripts: ReadonlyArray<Script>,
  ) {
    validateCategory(this);
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

function parseScriptsRecursively(category: Category): ReadonlyArray<Script> {
  return [
    ...category.scripts,
    ...category.subCategories.flatMap((c) => c.getAllScriptsRecursively()),
  ];
}

function validateCategory(category: Category) {
  if (!category.name) {
    throw new Error('missing name');
  }
  if (category.subCategories.length === 0 && category.scripts.length === 0) {
    throw new Error('A category must have at least one sub-category or script');
  }
}
