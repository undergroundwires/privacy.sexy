import { IApplication, ICategory, IScript } from '@/domain/IApplication';

export class ApplicationStub implements IApplication {
    public totalScripts = 0;
    public totalCategories = 0;
    public readonly name = 'StubApplication';
    public readonly repositoryUrl = 'https://privacy.sexy';
    public readonly version = '0.1.0';
    public readonly actions = new Array<ICategory>();

    public withAction(category: ICategory): ApplicationStub {
        this.actions.push(category);
        return this;
    }
    public findCategory(categoryId: number): ICategory {
        return this.getAllCategories().find(
            (category) => category.id === categoryId);
    }
    public getRecommendedScripts(): readonly IScript[] {
        throw new Error('Method not implemented: getRecommendedScripts');
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
