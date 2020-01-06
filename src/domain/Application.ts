import { IEntity } from '../infrastructure/Entity/IEntity';
import { ICategory } from './ICategory';
import { IScript } from './IScript';
import { IApplication } from './IApplication';

export class Application implements IApplication {
    public get totalScripts(): number { return this.flattened.allScripts.length; }
    public get totalCategories(): number { return this.flattened.allCategories.length; }

    private readonly flattened: IFlattenedApplication;

    constructor(
        public readonly name: string,
        public readonly version: number,
        public readonly categories: ReadonlyArray<ICategory>) {
        if (!name) {
            throw Error('Application has no name');
        }
        if (!version) {
            throw Error('Version cannot be zero');
        }
        this.flattened = flatten(categories);
        if (this.flattened.allCategories.length === 0) {
            throw new Error('Application must consist of at least one category');
        }
        if (this.flattened.allScripts.length === 0) {
            throw new Error('Application must consist of at least one script');
        }
        if (this.flattened.allScripts.filter((script) => script.isRecommended).length === 0) {
            throw new Error('Application must consist of at least one recommended script');
        }
        ensureNoDuplicates(this.flattened.allCategories);
        ensureNoDuplicates(this.flattened.allScripts);
    }

    public findCategory(categoryId: number): ICategory | undefined {
        return this.flattened.allCategories.find((category) => category.id === categoryId);
    }

    public getRecommendedScripts(): readonly IScript[] {
        return this.flattened.allScripts.filter((script) => script.isRecommended);
    }

    public findScript(scriptId: string): IScript | undefined {
        return this.flattened.allScripts.find((script) => script.id === scriptId);
    }

    public getAllScripts(): IScript[] {
        return this.flattened.allScripts;
    }
}

function ensureNoDuplicates<TKey>(entities: ReadonlyArray<IEntity<TKey>>) {
    const totalOccurencesById = new Map<TKey, number>();
    for (const entity of entities) {
        totalOccurencesById.set(entity.id, (totalOccurencesById.get(entity.id) || 0) + 1);
    }
    const duplicatedIds = new Array<TKey>();
    totalOccurencesById.forEach((index, id) => {
        if (index > 1) {
            duplicatedIds.push(id);
        }
    });
    if (duplicatedIds.length > 0) {
        const duplicatedIdsText = duplicatedIds.map((id) => `"${id}"`).join(',');
        throw new Error(
            `Duplicate entities are detected with following id(s): ${duplicatedIdsText}`);
    }
}

interface IFlattenedApplication {
    allCategories: ICategory[];
    allScripts: IScript[];
}

function flattenRecursive(
    categories: ReadonlyArray<ICategory>,
    flattened: IFlattenedApplication) {
    for (const category of categories) {
        flattened.allCategories.push(category);
        if (category.scripts) {
            for (const script of category.scripts) {
                flattened.allScripts.push(script);
            }
        }
        if (category.subCategories && category.subCategories.length > 0) {
            flattenRecursive(
                category.subCategories as ReadonlyArray<ICategory>,
                flattened);
        }
    }
}

function flatten(
    categories: ReadonlyArray<ICategory>): IFlattenedApplication {
    const flattened: IFlattenedApplication = {
        allCategories: new Array<ICategory>(),
        allScripts: new Array<IScript>(),
    };
    flattenRecursive(categories, flattened);
    return flattened;
}
