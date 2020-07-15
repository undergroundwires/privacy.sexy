import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';

export interface IApplication {
    readonly name: string;
    readonly repositoryUrl: string;
    readonly version: string;
    readonly totalScripts: number;
    readonly totalCategories: number;
    readonly actions: ReadonlyArray<ICategory>;

    getRecommendedScripts(): ReadonlyArray<IScript>;
    findCategory(categoryId: number): ICategory | undefined;
    findScript(scriptId: string): IScript | undefined;
    getAllScripts(): ReadonlyArray<IScript>;
    getAllCategories(): ReadonlyArray<ICategory>;
}

export { IScript } from '@/domain/IScript';
export { ICategory } from '@/domain/ICategory';
