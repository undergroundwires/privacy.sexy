import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import { IFilterChangeDetailsVisitor } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';

export class FilterChangeDetailsVisitorStub implements IFilterChangeDetailsVisitor {
  public readonly visitedEvents = new Array<FilterActionType>();

  public readonly visitedResults = new Array<IFilterResult>();

  onClear(): void {
    this.visitedEvents.push(FilterActionType.Clear);
  }

  onApply(filter: IFilterResult): void {
    this.visitedEvents.push(FilterActionType.Apply);
    this.visitedResults.push(filter);
  }
}
