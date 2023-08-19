import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IFilterChangeDetails } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { FilterResultStub } from './FilterResultStub';
import { EventSourceStub } from './EventSourceStub';

export class UserFilterStub implements IUserFilter {
  private readonly filterChangedSource = new EventSourceStub<IFilterChangeDetails>();

  public currentFilter: IFilterResult | undefined = new FilterResultStub();

  public filterChanged: IEventSource<IFilterChangeDetails> = this.filterChangedSource;

  public notifyFilterChange(change: IFilterChangeDetails) {
    this.filterChangedSource.notify(change);
    this.currentFilter = change.filter;
  }

  public withNoCurrentFilter() {
    return this.withCurrentFilterResult(undefined);
  }

  public withCurrentFilterResult(filter: IFilterResult | undefined) {
    this.currentFilter = filter;
    return this;
  }

  public applyFilter(): void { /* NO OP */ }

  public clearFilter(): void { /* NO OP */ }
}
