import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IEventSource } from '@/infrastructure/Events/IEventSource';

export class UserFilterStub implements IUserFilter {
  public currentFilter: IFilterResult;

  public filtered: IEventSource<IFilterResult>;

  public filterRemoved: IEventSource<void>;

  public setFilter(): void {
    throw new Error('Method not implemented.');
  }

  public removeFilter(): void {
    throw new Error('Method not implemented.');
  }
}
