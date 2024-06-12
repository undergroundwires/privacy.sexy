import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { CategoryStub } from './CategoryStub';
import { ScriptStub } from './ScriptStub';

export class FilterResultStub implements FilterResult {
  public categoryMatches: readonly Category[] = [];

  public scriptMatches: readonly Script[] = [];

  public query = '';

  public withEmptyMatches() {
    return this
      .withCategoryMatches([])
      .withScriptMatches([]);
  }

  public withSomeMatches() {
    return this
      .withCategoryMatches([new CategoryStub(3).withScriptIds('script-1')])
      .withScriptMatches([new ScriptStub('script-2')]);
  }

  public withCategoryMatches(matches: readonly Category[]) {
    this.categoryMatches = matches;
    return this;
  }

  public withScriptMatches(matches: readonly Script[]) {
    this.scriptMatches = matches;
    return this;
  }

  public withQueryAndSomeMatches() {
    return this
      .withQuery('non-empty query')
      .withSomeMatches();
  }

  public withQuery(query: string) {
    this.query = query;
    return this;
  }

  public hasAnyMatches(): boolean {
    return this.categoryMatches.length > 0 || this.scriptMatches.length > 0;
  }
}
