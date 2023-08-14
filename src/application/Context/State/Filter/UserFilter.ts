import { IScript } from '@/domain/IScript';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { FilterResult } from './FilterResult';
import { IFilterResult } from './IFilterResult';
import { IUserFilter } from './IUserFilter';
import { IFilterChangeDetails } from './Event/IFilterChangeDetails';
import { FilterChange } from './Event/FilterChange';

export class UserFilter implements IUserFilter {
  public readonly filterChanged = new EventSource<IFilterChangeDetails>();

  public currentFilter: IFilterResult | undefined;

  constructor(private collection: ICategoryCollection) {

  }

  public applyFilter(filter: string): void {
    if (!filter) {
      throw new Error('Filter must be defined and not empty. Use clearFilter() to remove the filter');
    }
    const filterLowercase = filter.toLocaleLowerCase();
    const filteredScripts = this.collection.getAllScripts().filter(
      (script) => isScriptAMatch(script, filterLowercase),
    );
    const filteredCategories = this.collection.getAllCategories().filter(
      (category) => category.name.toLowerCase().includes(filterLowercase),
    );
    const matches = new FilterResult(
      filteredScripts,
      filteredCategories,
      filter,
    );
    this.currentFilter = matches;
    this.filterChanged.notify(FilterChange.forApply(this.currentFilter));
  }

  public clearFilter(): void {
    this.currentFilter = undefined;
    this.filterChanged.notify(FilterChange.forClear());
  }
}

function isScriptAMatch(script: IScript, filterLowercase: string) {
  if (script.name.toLowerCase().includes(filterLowercase)) {
    return true;
  }
  if (script.code.execute.toLowerCase().includes(filterLowercase)) {
    return true;
  }
  if (script.code.revert) {
    return script.code.revert.toLowerCase().includes(filterLowercase);
  }
  return false;
}
