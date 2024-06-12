import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import type { FilterResult } from './FilterResult';

export class AppliedFilterResult implements FilterResult {
  constructor(
    public readonly scriptMatches: ReadonlyArray<Script>,
    public readonly categoryMatches: ReadonlyArray<Category>,
    public readonly query: string,
  ) {
    if (!query) { throw new Error('Query is empty or undefined'); }
  }

  public hasAnyMatches(): boolean {
    return this.scriptMatches.length > 0
      || this.categoryMatches.length > 0;
  }
}
