import { ScriptingDefinitionStub } from './ScriptingDefinitionStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptStub } from './ScriptStub';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

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
    public findCategory(categoryId: number): ICategory {
        return this.getAllCategories().find(
            (category) => category.id === categoryId);
    }
    public getScriptsByLevel(): readonly IScript[] {
        throw new Error('Method not implemented: getScriptsByLevel');
    }
    public findScript(scriptId: string): IScript {
        return this.getAllScripts().find((script) => scriptId === script.id);
    }
    public getAllScripts(): ReadonlyArray<IScript> {
        const scripts = [];
        for (const category of this.actions) {
            const categoryScripts = getScriptsRecursively(category);
            scripts.push(...categoryScripts);
        }
        return scripts;
    }
    public getAllCategories(): ReadonlyArray<ICategory> {
        const categories = [];
        categories.push(...this.actions);
        for (const category of this.actions) {
            const subCategories = getSubCategoriesRecursively(category);
            categories.push(...subCategories);
        }
        return categories;
    }
}

function getSubCategoriesRecursively(category: ICategory): ReadonlyArray<ICategory> {
    const subCategories = [];
    if (category.subCategories) {
        for (const subCategory of category.subCategories) {
            subCategories.push(subCategory);
            subCategories.push(...getSubCategoriesRecursively(subCategory));
        }
    }
    return subCategories;
}


function getScriptsRecursively(category: ICategory): ReadonlyArray<IScript> {
    const categoryScripts = [];
    if (category.scripts) {
        for (const script of category.scripts) {
            categoryScripts.push(script);
        }
    }
    if (category.subCategories) {
        for (const subCategory of category.subCategories) {
            const subCategoryScripts = getScriptsRecursively(subCategory);
            categoryScripts.push(...subCategoryScripts);
        }
    }
    return categoryScripts;
}
