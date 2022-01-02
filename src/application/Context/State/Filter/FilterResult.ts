import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { IFilterResult } from './IFilterResult';

export class FilterResult implements IFilterResult {
  constructor(
    public readonly scriptMatches: ReadonlyArray<IScript>,
    public readonly categoryMatches: ReadonlyArray<ICategory>,
    public readonly query: string,
  ) {
    if (!query) { throw new Error('Query is empty or undefined'); }
    if (!scriptMatches) { throw new Error('Script matches is undefined'); }
    if (!categoryMatches) { throw new Error('Category matches is undefined'); }
  }

  public hasAnyMatches(): boolean {
    return this.scriptMatches.length > 0
      || this.categoryMatches.length > 0;
  }
}
