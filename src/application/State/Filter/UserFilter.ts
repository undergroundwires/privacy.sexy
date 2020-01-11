import { FilterResult } from './FilterResult';
import { IFilterResult } from './IFilterResult';
import { Application } from '../../../domain/Application';
import { IUserFilter } from './IUserFilter';
import { Signal } from '@/infrastructure/Events/Signal';

export class UserFilter implements IUserFilter {
    public readonly filtered = new Signal<IFilterResult>();
    public readonly filterRemoved = new Signal<void>();

    constructor(private application: Application) {

    }

    public setFilter(filter: string): void {
        if (!filter) {
            throw new Error('Filter must be defined and not empty. Use removeFilter() to remove the filter');
        }
        const filteredScripts = this.application.getAllScripts().filter(
            (script) =>
            script.name.toLowerCase().includes(filter.toLowerCase()) ||
            script.code.toLowerCase().includes(filter.toLowerCase()));
        const filteredCategories = this.application.getAllCategories().filter(
            (script) => script.name.toLowerCase().includes(filter.toLowerCase()));

        const matches = new FilterResult(
            filteredScripts,
            filteredCategories,
            filter,
        );

        this.filtered.notify(matches);
    }

    public removeFilter(): void {
        this.filterRemoved.notify();
    }
}
