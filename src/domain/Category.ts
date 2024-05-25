import { BaseEntity } from '../infrastructure/Entity/BaseEntity';
import type { ICategory } from './ICategory';
import type { IScript } from './IScript';

export class Category extends BaseEntity<number> implements ICategory {
  private allSubScripts?: ReadonlyArray<IScript> = undefined;

  public readonly name: string;

  public readonly docs: ReadonlyArray<string>;

  public readonly subCategories: ReadonlyArray<ICategory>;

  public readonly scripts: ReadonlyArray<IScript>;

  constructor(parameters: CategoryInitParameters) {
    super(parameters.id);
    validateParameters(parameters);
    this.name = parameters.name;
    this.docs = parameters.docs;
    this.subCategories = parameters.subcategories;
    this.scripts = parameters.scripts;
  }

  public includes(script: IScript): boolean {
    return this.getAllScriptsRecursively().some((childScript) => childScript.id === script.id);
  }

  public getAllScriptsRecursively(): readonly IScript[] {
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
  readonly subcategories: ReadonlyArray<ICategory>;
  readonly scripts: ReadonlyArray<IScript>;
}

function parseScriptsRecursively(category: ICategory): ReadonlyArray<IScript> {
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
