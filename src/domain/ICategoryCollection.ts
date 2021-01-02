import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { IProjectInformation } from '@/domain/IProjectInformation';

export interface ICategoryCollection {
    readonly info: IProjectInformation;
    readonly scripting: IScriptingDefinition;
    readonly os: OperatingSystem;
    readonly totalScripts: number;
    readonly totalCategories: number;
    readonly actions: ReadonlyArray<ICategory>;

    getScriptsByLevel(level: RecommendationLevel): ReadonlyArray<IScript>;
    findCategory(categoryId: number): ICategory | undefined;
    findScript(scriptId: string): IScript | undefined;
    getAllScripts(): ReadonlyArray<IScript>;
    getAllCategories(): ReadonlyArray<ICategory>;
}
