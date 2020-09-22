import { IEntity } from '../infrastructure/Entity/IEntity';
import { ICategory } from './ICategory';
import { IScript } from './IScript';
import { IApplication } from './IApplication';
import { IProjectInformation } from './IProjectInformation';

export class Application implements IApplication {
    public get totalScripts(): number { return this.flattened.allScripts.length; }
    public get totalCategories(): number { return this.flattened.allCategories.length; }

    private readonly flattened: IFlattenedApplication;

    constructor(
        public readonly info: IProjectInformation,
        public readonly actions: ReadonlyArray<ICategory>) {
        if (!info) {
            throw new Error('info is undefined');
        }
        this.flattened = flatten(actions);
        ensureValid(this.flattened);
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

    public getAllCategories(): ICategory[] {
        return this.flattened.allCategories;
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

function ensureValid(application: IFlattenedApplication) {
    if (!application.allCategories || application.allCategories.length === 0) {
        throw new Error('Application must consist of at least one category');
    }
    if (!application.allScripts || application.allScripts.length === 0) {
        throw new Error('Application must consist of at least one script');
    }
    if (application.allScripts.filter((script) => script.isRecommended).length === 0) {
        throw new Error('Application must consist of at least one recommended script');
    }
}

function flattenCategories(
    categories: ReadonlyArray<ICategory>,
    flattened: IFlattenedApplication): IFlattenedApplication {
    if (!categories || categories.length === 0) {
        return flattened;
    }
    for (const category of categories) {
        flattened.allCategories.push(category);
        flattened = flattenScripts(category.scripts, flattened);
        flattened = flattenCategories(category.subCategories, flattened);
    }
    return flattened;
}

function flattenScripts(
    scripts: ReadonlyArray<IScript>,
    flattened: IFlattenedApplication): IFlattenedApplication {
    if (!scripts) {
        return flattened;
    }
    for (const script of scripts) {
        flattened.allScripts.push(script);
    }
    return flattened;
}

function flatten(
    categories: ReadonlyArray<ICategory>): IFlattenedApplication {
    let flattened: IFlattenedApplication = {
        allCategories: new Array<ICategory>(),
        allScripts: new Array<IScript>(),
    };
    flattened = flattenCategories(categories, flattened);
    return flattened;
}
