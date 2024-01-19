import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IFilterChangeDetails } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import { FilterResultStub } from './FilterResultStub';
import { EventSourceStub } from './EventSourceStub';

export enum UserFilterMethod {
  ApplyFilter,
  ClearFilter,
}

export class UserFilterStub implements IUserFilter {
  private readonly filterChangedSource = new EventSourceStub<IFilterChangeDetails>();

  public readonly callHistory = new Array<UserFilterMethod>();

  public currentFilter: IFilterResult | undefined = new FilterResultStub();

  public filterChanged: IEventSource<IFilterChangeDetails> = this.filterChangedSource;

  public notifyFilterChange(change: IFilterChangeDetails) {
    this.filterChangedSource.notify(change);
    if (change.action.type === FilterActionType.Apply) {
      this.currentFilter = change.action.filter;
    } else {
      this.currentFilter = undefined;
    }
  }

  public withNoCurrentFilter() {
    return this.withCurrentFilterResult(undefined);
  }

  public withCurrentFilterResult(filter: IFilterResult | undefined) {
    this.currentFilter = filter;
    return this;
  }

  public applyFilter(): void {
    this.callHistory.push(UserFilterMethod.ApplyFilter);
  }

  public clearFilter(): void {
    this.callHistory.push(UserFilterMethod.ClearFilter);
  }
}
