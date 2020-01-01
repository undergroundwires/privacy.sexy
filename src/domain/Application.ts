import { IEntity } from '../infrastructure/Entity/IEntity';
import { ICategory } from './ICategory';
import { IScript } from './IScript';
import { IApplication } from './IApplication';

export class Application implements IApplication {
    private static mustHaveCategories(categories: ReadonlyArray<ICategory>) {
        if (!categories || categories.length === 0) {
            throw new Error('an application must consist of at least one category');
        }
    }

    /**
     * Checks all categories against duplicates, throws exception if it find any duplicates
     * @return {number} Total unique categories
     */
    /** Checks all categories against duplicates, throws exception if it find any duplicates returns total categories */
    private static mustNotHaveDuplicatedCategories(categories: ReadonlyArray<ICategory>): number {
        return Application.ensureNoDuplicateEntities(categories, Application.visitAllCategoriesOnce);
    }

    /**
     * Checks all scripts against duplicates, throws exception if it find any scripts duplicates total scripts.
     * @return {number} Total unique scripts
     */
    private static mustNotHaveDuplicatedScripts(categories: ReadonlyArray<ICategory>): number {
        return Application.ensureNoDuplicateEntities(categories, Application.visitAllScriptsOnce);
    }

    /**
     * Checks entities against duplicates using a visit function, throws exception if it find any duplicates.
     * @return {number} Result from the visit function
     */
    private static ensureNoDuplicateEntities<TKey>(
        categories: ReadonlyArray<ICategory>,
        visitFunction: (categories: ReadonlyArray<ICategory>,
                        handler: (entity: IEntity<TKey>) => any) => number): number {
        const totalOccurencesById = new Map<TKey, number>();
        const totalVisited = visitFunction(categories,
            (entity) =>
            totalOccurencesById.set(entity.id,
                (totalOccurencesById.get(entity.id) || 0) + 1));
        const duplicatedIds = new Array<TKey>();
        totalOccurencesById.forEach((count, id) => {
            if (count > 1) {
                duplicatedIds.push(id);
            }
        });
        if (duplicatedIds.length > 0) {
            const duplicatedIdsText = duplicatedIds.map((id) => `"${id}"`).join(',');
            throw new Error(
                `Duplicate entities are detected with following id(s): ${duplicatedIdsText}`);
        }
        return totalVisited;
    }

    // Runs handler on each category and returns sum of total visited categories
    private static visitAllCategoriesOnce(
        categories: ReadonlyArray<ICategory>,
        handler: (category: ICategory) => any): number {
        let total = 0;
        for (const category of categories) {
            handler(category);
            total++;
            if (category.subCategories && category.subCategories.length > 0) {
                total += Application.visitAllCategoriesOnce(
                    category.subCategories as ReadonlyArray<ICategory>,
                    handler);
            }
        }
        return total;
    }

    // Runs handler on each script and returns sum of total visited scripts
    private static visitAllScriptsOnce(
        categories: ReadonlyArray<ICategory>,
        handler: (script: IScript) => any): number {
        let total = 0;
        Application.visitAllCategoriesOnce(categories,
            (category) => {
                if (category.scripts) {
                    for (const script of category.scripts) {
                        handler(script);
                        total++;
                    }
                }
            });
        return total;
    }

    public readonly totalScripts: number;
    public readonly totalCategories: number;

    constructor(
        public readonly name: string,
        public readonly version: number,
        public readonly categories: ReadonlyArray<ICategory>) {
        Application.mustHaveCategories(categories);
        this.totalCategories = Application.mustNotHaveDuplicatedCategories(categories);
        this.totalScripts = Application.mustNotHaveDuplicatedScripts(categories);
    }

    public findCategory(categoryId: number): ICategory | undefined {
        let result: ICategory | undefined;
        Application.visitAllCategoriesOnce(this.categories,
            (category) => {
                if (category.id === categoryId) {
                    result = category;
                }
            });
        return result;
    }

    public findScript(scriptId: string): IScript | undefined {
        let result: IScript | undefined;
        Application.visitAllScriptsOnce(this.categories,
            (script) => {
                if (script.id === scriptId) {
                    result = script;
                }
            });
        return result;
    }

    public getAllScripts(): IScript[] {
        const result = new Array<IScript>();
        Application.visitAllScriptsOnce(this.categories,
            (script) => {
                result.push(script);
            });
        return result;
    }
}
