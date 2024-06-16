import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableId } from '../Identifiable';

export type CategoryFactory = (
  parameters: CategoryInitParameters,
) => Category;

export interface CategoryInitParameters {
  readonly executableId: ExecutableId;
  readonly name: string;
  readonly docs: ReadonlyArray<string>;
  readonly subcategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
}

export const createCategory: CategoryFactory = (
  parameters,
) => {
  return new CollectionCategory(parameters);
};

class CollectionCategory implements Category {
  public readonly executableId: ExecutableId;

  public readonly name: string;

  public readonly docs: ReadonlyArray<string>;

  public readonly subcategories: ReadonlyArray<Category>;

  public readonly scripts: ReadonlyArray<Script>;

  private allSubScripts?: ReadonlyArray<Script> = undefined;

  constructor(parameters: CategoryInitParameters) {
    validateParameters(parameters);
    this.executableId = parameters.executableId;
    this.name = parameters.name;
    this.docs = parameters.docs;
    this.subcategories = parameters.subcategories;
    this.scripts = parameters.scripts;
  }

  public includes(script: Script): boolean {
    return this
      .getAllScriptsRecursively()
      .some((childScript) => childScript.executableId === script.executableId);
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
    ...category.subcategories.flatMap((c) => c.getAllScriptsRecursively()),
  ];
}

function validateParameters(parameters: CategoryInitParameters) {
  if (!parameters.executableId) {
    throw new Error('missing ID');
  }
  if (!parameters.name) {
    throw new Error('missing name');
  }
  if (parameters.subcategories.length === 0 && parameters.scripts.length === 0) {
    throw new Error('A category must have at least one sub-category or script');
  }
}
