import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';

export interface IApplication {
    readonly categories: ReadonlyArray<ICategory>;
    findCategory(categoryId: number): ICategory | undefined;
    findScript(scriptId: string): IScript | undefined;
    getAllScripts(): ReadonlyArray<IScript>;
}

export { IScript } from '@/domain/IScript';
export { ICategory } from '@/domain/ICategory';
