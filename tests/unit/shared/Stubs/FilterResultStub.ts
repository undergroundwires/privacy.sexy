import type { ICategory } from '@/domain/ICategory';
import type { IScript } from '@/domain/IScript';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { CategoryStub } from './CategoryStub';
import { ScriptStub } from './ScriptStub';

export class FilterResultStub implements FilterResult {
  public categoryMatches: readonly ICategory[] = [];

  public scriptMatches: readonly IScript[] = [];

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

  public withCategoryMatches(matches: readonly ICategory[]) {
    this.categoryMatches = matches;
    return this;
  }

  public withScriptMatches(matches: readonly IScript[]) {
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
