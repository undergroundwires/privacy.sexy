import { IScript, ICategory } from '@/domain/ICategory';

export interface IFilterMatches {
    readonly scriptMatches: ReadonlyArray<IScript>;
    readonly categoryMatches: ReadonlyArray<ICategory>;
    readonly query: string;
}
