import type { FilterChangeDetailsVisitor } from '@/application/Context/State/Filter/Event/FilterChangeDetails';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class FilterChangeDetailsVisitorStub
  extends StubWithObservableMethodCalls<Required<FilterChangeDetailsVisitor>>
  implements FilterChangeDetailsVisitor {
  public onClear(): void {
    this.registerMethodCall({
      methodName: 'onClear',
      args: [],
    });
  }

  public onApply(filter: FilterResult): void {
    this.registerMethodCall({
      methodName: 'onApply',
      args: [filter],
    });
  }
}
