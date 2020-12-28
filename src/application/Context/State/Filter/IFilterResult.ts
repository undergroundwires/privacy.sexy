import { IScript, ICategory } from '@/domain/ICategory';

export interface IFilterResult {
    readonly categoryMatches: ReadonlyArray<ICategory>;
    readonly scriptMatches: ReadonlyArray<IScript>;
    readonly query: string;
    hasAnyMatches(): boolean;
}
