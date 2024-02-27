import type { IScript, ICategory } from '@/domain/ICategory';

export interface FilterResult {
  readonly categoryMatches: ReadonlyArray<ICategory>;
  readonly scriptMatches: ReadonlyArray<IScript>;
  readonly query: string;
  hasAnyMatches(): boolean;
}
