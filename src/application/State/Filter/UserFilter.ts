import { IScript } from '@/domain/IScript';
import { FilterResult } from './FilterResult';
import { IFilterResult } from './IFilterResult';
import { IApplication } from '@/domain/IApplication';
import { IUserFilter } from './IUserFilter';
import { Signal } from '@/infrastructure/Events/Signal';

export class UserFilter implements IUserFilter {
    public readonly filtered = new Signal<IFilterResult>();
    public readonly filterRemoved = new Signal<void>();
    public currentFilter: IFilterResult | undefined;

    constructor(private application: IApplication) {

    }

    public setFilter(filter: string): void {
        if (!filter) {
            throw new Error('Filter must be defined and not empty. Use removeFilter() to remove the filter');
        }
        const filterLowercase = filter.toLocaleLowerCase();
        const filteredScripts = this.application.getAllScripts().filter(
            (script) => isScriptAMatch(script, filterLowercase));
        const filteredCategories = this.application.getAllCategories().filter(
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
    if (script.code.toLowerCase().includes(filterLowercase)) {
        return true;
    }
    if (script.revertCode) {
        return script.revertCode.toLowerCase().includes(filterLowercase);
    }
    return false;
}
