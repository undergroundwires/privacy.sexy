import type { IScript } from '@/domain/IScript';
import type { ICategory } from '@/domain/ICategory';
import type { FilterResult } from './FilterResult';

export class AppliedFilterResult implements FilterResult {
  constructor(
    public readonly scriptMatches: ReadonlyArray<IScript>,
    public readonly categoryMatches: ReadonlyArray<ICategory>,
    public readonly query: string,
  ) {
    if (!query) { throw new Error('Query is empty or undefined'); }
  }

  public hasAnyMatches(): boolean {
    return this.scriptMatches.length > 0
      || this.categoryMatches.length > 0;
  }
}
