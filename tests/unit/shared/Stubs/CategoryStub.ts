import type { Category } from '@/domain/Executables/Category/Category';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { ScriptStub } from './ScriptStub';

export class CategoryStub implements Category {
  public name = `[${CategoryStub.name}] name (ID: ${this.executableId})`;

  public readonly subcategories = new Array<Category>();

  public readonly scripts = new Array<Script>();

  public docs: readonly string[] = new Array<string>();

  private allScriptsRecursively: (readonly Script[]) | undefined;

  public constructor(
    readonly executableId: ExecutableId,
  ) { }

  public includes(script: Script): boolean {
    return this.getAllScriptsRecursively().some((s) => s.executableId === script.executableId);
  }

  public getAllScriptsRecursively(): readonly Script[] {
    if (this.allScriptsRecursively === undefined) {
      return [
        ...this.scripts,
        ...this.subcategories.flatMap((c) => c.getAllScriptsRecursively()),
      ];
    }
    return this.allScriptsRecursively;
  }

  public withScriptIds(...scriptIds: readonly ExecutableId[]): this {
    return this.withScripts(
      ...scriptIds.map((id) => new ScriptStub(id)),
    );
  }

  public withScripts(...scripts: Script[]): this {
    for (const script of scripts) {
      this.withScript(script);
    }
    return this;
  }

  public withAllScriptIdsRecursively(...scriptIds: readonly string[]): this {
    return this.withAllScriptsRecursively(...scriptIds.map((id) => new ScriptStub(id)));
  }

  public withAllScriptsRecursively(...scripts: Script[]): this {
    this.allScriptsRecursively = [...scripts];
    return this;
  }

  public withMandatoryScripts(): this {
    return this
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-1`).withLevel(RecommendationLevel.Standard))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-2`).withLevel(RecommendationLevel.Strict))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-3`).withLevel(undefined));
  }

  public withCategories(...categories: Category[]): this {
    for (const category of categories) {
      this.withCategory(category);
    }
    return this;
  }

  public withCategory(category: Category): this {
    this.subcategories.push(category);
    return this;
  }

  public withScript(script: Script): this {
    this.scripts.push(script);
    return this;
  }

  public withName(categoryName: string): this {
    this.name = categoryName;
    return this;
  }

  public withDocs(docs: readonly string[]): this {
    this.docs = docs;
    return this;
  }
}
