import { OperatingSystem } from '@/domain/OperatingSystem';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptStub } from './ScriptStub';
import { ScriptingDefinitionStub } from './ScriptingDefinitionStub';

export class CategoryCollectionStub implements ICategoryCollection {
  public scripting: IScriptingDefinition = new ScriptingDefinitionStub();

  public os = OperatingSystem.Linux;

  public initialScript: IScript = new ScriptStub('55');

  public totalScripts = 0;

  public totalCategories = 0;

  public readonly actions = new Array<ICategory>();

  public withAction(category: ICategory): CategoryCollectionStub {
    this.actions.push(category);
    return this;
  }

  public withOs(os: OperatingSystem): CategoryCollectionStub {
    this.os = os;
    return this;
  }

  public withScripting(scripting: IScriptingDefinition): CategoryCollectionStub {
    this.scripting = scripting;
    return this;
  }

  public withInitialScript(script: IScript): CategoryCollectionStub {
    this.initialScript = script;
    return this;
  }

  public withTotalScripts(totalScripts: number) {
    this.totalScripts = totalScripts;
    return this;
  }

  public findCategory(categoryId: number): ICategory {
    return this.getAllCategories()
      .find((category) => category.id === categoryId);
  }

  public getScriptsByLevel(level: RecommendationLevel): readonly IScript[] {
    return this.getAllScripts()
      .filter((script) => script.level !== undefined && script.level <= level);
  }

  public findScript(scriptId: string): IScript {
    return this.getAllScripts()
      .find((script) => scriptId === script.id);
  }

  public getAllScripts(): ReadonlyArray<IScript> {
    return this.actions.flatMap((category) => getScriptsRecursively(category));
  }

  public getAllCategories(): ReadonlyArray<ICategory> {
    return this.actions.flatMap(
      (category) => [category, ...getSubCategoriesRecursively(category)],
    );
  }
}

function getSubCategoriesRecursively(category: ICategory): ReadonlyArray<ICategory> {
  return (category.subCategories || []).flatMap(
    (subCategory) => [subCategory, ...getSubCategoriesRecursively(subCategory)],
  );
}

function getScriptsRecursively(category: ICategory): ReadonlyArray<IScript> {
  return [
    ...(category.scripts || []),
    ...(category.subCategories || []).flatMap(
      (subCategory) => getScriptsRecursively(subCategory),
    ),
  ];
}
