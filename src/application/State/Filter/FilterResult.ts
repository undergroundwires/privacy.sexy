import { IFilterResult } from './IFilterResult';
import { IScript } from '@/domain/Script';
import { ICategory } from '@/domain/ICategory';

export class FilterResult implements IFilterResult {
    constructor(
        public readonly scriptMatches: ReadonlyArray<IScript>,
        public readonly categoryMatches: ReadonlyArray<ICategory>,
        public readonly query: string) {
        if (!query) { throw new Error('Query is empty or undefined'); }
        if (!scriptMatches) { throw new Error('Script matches is undefined'); }
        if (!categoryMatches) { throw new Error('Category matches is undefined'); }
    }
    public hasAnyMatches(): boolean {
        return this.scriptMatches.length > 0
         || this.categoryMatches.length > 0;
    }
}
