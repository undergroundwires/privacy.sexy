import { getEnumNames, getEnumValues } from '@/application/Common/Enum';
import { IEntity } from '../infrastructure/Entity/IEntity';
import { ICategory } from './ICategory';
import { IScript } from './IScript';
import { IApplication } from './IApplication';
import { IProjectInformation } from './IProjectInformation';
import { RecommendationLevel } from './RecommendationLevel';
import { OperatingSystem } from './OperatingSystem';
import { IScriptingDefinition } from './IScriptingDefinition';

export class Application implements IApplication {
    public get totalScripts(): number { return this.queryable.allScripts.length; }
    public get totalCategories(): number { return this.queryable.allCategories.length; }

    private readonly queryable: IQueryableApplication;

    constructor(
        public readonly os: OperatingSystem,
        public readonly info: IProjectInformation,
        public readonly actions: ReadonlyArray<ICategory>,
        public readonly scripting: IScriptingDefinition) {
        if (!info) {
            throw new Error('undefined info');
        }
        if (!scripting) {
            throw new Error('undefined scripting definition');
        }
        this.queryable = makeQueryable(actions);
        ensureValidOs(os);
        ensureValid(this.queryable);
        ensureNoDuplicates(this.queryable.allCategories);
        ensureNoDuplicates(this.queryable.allScripts);
    }

    public findCategory(categoryId: number): ICategory | undefined {
        return this.queryable.allCategories.find((category) => category.id === categoryId);
    }

    public getScriptsByLevel(level: RecommendationLevel): readonly IScript[] {
        if (isNaN(level)) {
            throw new Error('undefined level');
        }
        if (!(level in RecommendationLevel)) {
            throw new Error(`invalid level: ${level}`);
        }
        return this.queryable.scriptsByLevel.get(level);
    }

    public findScript(scriptId: string): IScript | undefined {
        return this.queryable.allScripts.find((script) => script.id === scriptId);
    }

    public getAllScripts(): IScript[] {
        return this.queryable.allScripts;
    }

    public getAllCategories(): ICategory[] {
        return this.queryable.allCategories;
    }
}

function ensureValidOs(os: OperatingSystem): void {
    if (os === undefined) {
        throw new Error('undefined os');
    }
    if (os === OperatingSystem.Unknown) {
        throw new Error('unknown os');
    }
    if (!(os in OperatingSystem)) {
        throw new Error(`os "${os}" is out of range`);
    }
}

function ensureNoDuplicates<TKey>(entities: ReadonlyArray<IEntity<TKey>>) {
    const totalOccurrencesById = new Map<TKey, number>();
    for (const entity of entities) {
        totalOccurrencesById.set(entity.id, (totalOccurrencesById.get(entity.id) || 0) + 1);
    }
    const duplicatedIds = new Array<TKey>();
    totalOccurrencesById.forEach((index, id) => {
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

interface IQueryableApplication {
    allCategories: ICategory[];
    allScripts: IScript[];
    scriptsByLevel: Map<RecommendationLevel, readonly IScript[]>;
}

function ensureValid(application: IQueryableApplication) {
    ensureValidCategories(application.allCategories);
    ensureValidScripts(application.allScripts);
}

function ensureValidCategories(allCategories: readonly ICategory[]) {
    if (!allCategories || allCategories.length === 0) {
        throw new Error('Application must consist of at least one category');
    }
}

function ensureValidScripts(allScripts: readonly IScript[]) {
    if (!allScripts || allScripts.length === 0) {
        throw new Error('Application must consist of at least one script');
    }
    for (const level of getEnumValues(RecommendationLevel)) {
        if (allScripts.every((script) => script.level !== level)) {
            throw new Error(`none of the scripts are recommended as ${RecommendationLevel[level]}`);
        }
    }
}

function flattenApplication(categories: ReadonlyArray<ICategory>): [ICategory[], IScript[]] {
    const allCategories = new Array<ICategory>();
    const allScripts = new Array<IScript>();
    flattenCategories(categories, allCategories, allScripts);
    return [
        allCategories,
        allScripts,
    ];
}

function flattenCategories(
    categories: ReadonlyArray<ICategory>,
    allCategories: ICategory[],
    allScripts: IScript[]): IQueryableApplication {
    if (!categories || categories.length === 0) {
        return;
    }
    for (const category of categories) {
        allCategories.push(category);
        flattenScripts(category.scripts, allScripts);
        flattenCategories(category.subCategories, allCategories, allScripts);
    }
}

function flattenScripts(
    scripts: ReadonlyArray<IScript>,
    allScripts: IScript[]): IScript[] {
    if (!scripts) {
        return;
    }
    for (const script of scripts) {
        allScripts.push(script);
    }
}

function makeQueryable(
    actions: ReadonlyArray<ICategory>): IQueryableApplication {
    const flattened = flattenApplication(actions);
    return {
        allCategories: flattened[0],
        allScripts: flattened[1],
        scriptsByLevel: groupByLevel(flattened[1]),
    };
}

function groupByLevel(allScripts: readonly IScript[]): Map<RecommendationLevel, readonly IScript[]> {
    const map = new Map<RecommendationLevel, readonly IScript[]>();
    for (const levelName of getEnumNames(RecommendationLevel)) {
        const level = RecommendationLevel[levelName];
        const scripts = allScripts.filter((script) => script.level !== undefined && script.level <= level);
        map.set(level, scripts);
    }
    return map;
}
