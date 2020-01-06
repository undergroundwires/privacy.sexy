import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';

export interface IApplication {
    readonly name: string;
    readonly version: number;
    readonly categories: ReadonlyArray<ICategory>;
    readonly totalScripts: number;
    readonly totalCategories: number;

    getRecommendedScripts(): ReadonlyArray<IScript>;
    findCategory(categoryId: number): ICategory | undefined;
    findScript(scriptId: string): IScript | undefined;
    getAllScripts(): ReadonlyArray<IScript>;
}

export { IScript } from '@/domain/IScript';
export { ICategory } from '@/domain/ICategory';
