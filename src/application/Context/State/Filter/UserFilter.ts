import { IScript } from '@/domain/IScript';
import { FilterResult } from './FilterResult';
import { IFilterResult } from './IFilterResult';
import { IUserFilter } from './IUserFilter';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

export class UserFilter implements IUserFilter {
    public readonly filtered = new EventSource<IFilterResult>();
    public readonly filterRemoved = new EventSource<void>();
    public currentFilter: IFilterResult | undefined;

    constructor(private collection: ICategoryCollection) {

    }

    public setFilter(filter: string): void {
        if (!filter) {
            throw new Error('Filter must be defined and not empty. Use removeFilter() to remove the filter');
        }
        const filterLowercase = filter.toLocaleLowerCase();
        const filteredScripts = this.collection.getAllScripts().filter(
            (script) => isScriptAMatch(script, filterLowercase));
        const filteredCategories = this.collection.getAllCategories().filter(
            (category) => category.name.toLowerCase().includes(filterLowercase));
        const matches = new FilterResult(
            filteredScripts,
            filteredCategories,
            filter,
        );
        this.currentFilter = matches;
        this.filtered.notify(matches);
    }

    public removeFilter(): void {
        this.currentFilter = undefined;
        this.filterRemoved.notify();
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
