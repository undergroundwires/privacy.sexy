import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import type { Category } from './Category';
import type { Script } from '../Script/Script';

export class CollectionCategory extends BaseEntity<number> implements Category {
  private allSubScripts?: ReadonlyArray<Script> = undefined;

  public readonly name: string;

  public readonly docs: ReadonlyArray<string>;

  public readonly subCategories: ReadonlyArray<Category>;

  public readonly scripts: ReadonlyArray<Script>;

  constructor(parameters: CategoryInitParameters) {
    super(parameters.id);
    validateParameters(parameters);
    this.name = parameters.name;
    this.docs = parameters.docs;
    this.subCategories = parameters.subcategories;
    this.scripts = parameters.scripts;
  }

  public includes(script: Script): boolean {
    return this.getAllScriptsRecursively().some((childScript) => childScript.id === script.id);
  }

  public getAllScriptsRecursively(): readonly Script[] {
    if (!this.allSubScripts) {
      this.allSubScripts = parseScriptsRecursively(this);
    }
    return this.allSubScripts;
  }
}

export interface CategoryInitParameters {
  readonly id: number;
  readonly name: string;
  readonly docs: ReadonlyArray<string>;
  readonly subcategories: ReadonlyArray<Category>;
  readonly scripts: ReadonlyArray<Script>;
}

function parseScriptsRecursively(category: Category): ReadonlyArray<Script> {
  return [
    ...category.scripts,
    ...category.subCategories.flatMap((c) => c.getAllScriptsRecursively()),
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
