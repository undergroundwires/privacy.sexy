import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';

export interface FilterResult {
  readonly categoryMatches: ReadonlyArray<Category>;
  readonly scriptMatches: ReadonlyArray<Script>;
  readonly query: string;
  hasAnyMatches(): boolean;
}
