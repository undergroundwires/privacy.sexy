import type { FilterContext } from '@/application/Context/State/Filter/FilterContext';
import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { FilterChangeDetails } from '@/application/Context/State/Filter/Event/FilterChangeDetails';
import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { FilterResultStub } from './FilterResultStub';
import { EventSourceStub } from './EventSourceStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export enum FilterMethod {
  ApplyFilter,
  ClearFilter,
}

export class FilterContextStub
  extends StubWithObservableMethodCalls<FilterContext>
  implements FilterContext {
  private readonly filterChangedSource = new EventSourceStub<FilterChangeDetails>();

  public currentFilter: FilterResult | undefined = new FilterResultStub();

  public filterChanged: IEventSource<FilterChangeDetails> = this.filterChangedSource;

  public notifyFilterChange(change: FilterChangeDetails): void {
    this.filterChangedSource.notify(change);
    if (change.action.type === FilterActionType.Apply) {
      this.currentFilter = change.action.filter;
    } else {
      this.currentFilter = undefined;
    }
  }

  public withNoCurrentFilter(): this {
    return this.withCurrentFilter(undefined);
  }

  public withCurrentFilter(filter: FilterResult | undefined): this {
    this.currentFilter = filter;
    return this;
  }

  public applyFilter(...args: Parameters<FilterContext['applyFilter']>): void {
    this.registerMethodCall({
      methodName: 'applyFilter',
      args: [...args],
    });
  }

  public clearFilter(): void {
    this.registerMethodCall({
      methodName: 'clearFilter',
      args: [],
    });
  }
}
