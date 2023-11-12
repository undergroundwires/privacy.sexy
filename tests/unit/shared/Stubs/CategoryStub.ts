import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { ICategory, IScript } from '@/domain/ICategory';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptStub } from './ScriptStub';

export class CategoryStub extends BaseEntity<number> implements ICategory {
  public name = `category-with-id-${this.id}`;

  public readonly subCategories = new Array<ICategory>();

  public readonly scripts = new Array<IScript>();

  public readonly docs = new Array<string>();

  public constructor(id: number) {
    super(id);
  }

  public includes(script: IScript): boolean {
    return this.getAllScriptsRecursively().some((s) => s.id === script.id);
  }

  public getAllScriptsRecursively(): readonly IScript[] {
    return [
      ...this.scripts,
      ...this.subCategories.flatMap((c) => c.getAllScriptsRecursively()),
    ];
  }

  public withScriptIds(...scriptIds: string[]): this {
    return this.withScripts(
      ...scriptIds.map((id) => new ScriptStub(id)),
    );
  }

  public withScripts(...scripts: IScript[]): this {
    for (const script of scripts) {
      this.withScript(script);
    }
    return this;
  }

  public withMandatoryScripts(): this {
    return this
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-1`).withLevel(RecommendationLevel.Standard))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-2`).withLevel(RecommendationLevel.Strict))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-3`).withLevel(undefined));
  }

  public withCategories(...categories: ICategory[]): this {
    for (const category of categories) {
      this.withCategory(category);
    }
    return this;
  }

  public withCategory(category: ICategory): this {
    this.subCategories.push(category);
    return this;
  }

  public withScript(script: IScript): this {
    this.scripts.push(script);
    return this;
  }

  public withName(categoryName: string): this {
    this.name = categoryName;
    return this;
  }
}
