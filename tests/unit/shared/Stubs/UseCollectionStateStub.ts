import { shallowRef } from 'vue';
import type {
  ContextModifier, IStateCallbackSettings, NewStateEventHandler,
  StateModifier, useCollectionState,
} from '@/presentation/components/Shared/Hooks/UseCollectionState';
import type { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import type { FilterContext } from '@/application/Context/State/Filter/FilterContext';
import type { IApplicationContext } from '@/application/Context/IApplicationContext';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { CategoryCollectionStateStub } from './CategoryCollectionStateStub';
import { ApplicationContextStub } from './ApplicationContextStub';
import { FilterContextStub } from './FilterContextStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class UseCollectionStateStub
  extends StubWithObservableMethodCalls<ReturnType<typeof useCollectionState>> {
  private currentContext: IApplicationContext = new ApplicationContextStub();

  private readonly currentState = shallowRef<ICategoryCollectionState>(
    new CategoryCollectionStateStub(),
  );

  public withFilter(filter: FilterContext) {
    const state = new CategoryCollectionStateStub()
      .withFilter(filter);
    const context = new ApplicationContextStub()
      .withState(state);
    return new UseCollectionStateStub()
      .withState(state)
      .withContext(context);
  }

  public withFilterResult(filterResult: FilterResult | undefined) {
    const filter = new FilterContextStub()
      .withCurrentFilter(filterResult);
    return this.withFilter(filter);
  }

  public withContext(context: IApplicationContext) {
    this.currentContext = context;
    return this;
  }

  public withState(state: ICategoryCollectionState) {
    this.currentState.value = state;
    return this;
  }

  public get state(): ICategoryCollectionState {
    return this.currentState.value;
  }

  public isStateModified(): boolean {
    const call = this.callHistory.find((c) => c.methodName === 'modifyCurrentState');
    return call !== undefined;
  }

  public triggerImmediateStateChange(): void {
    this.triggerOnStateChange({
      newState: this.currentState.value,
      immediateOnly: true,
    });
  }

  public triggerOnStateChange(scenario: {
    readonly newState: ICategoryCollectionState,
    readonly immediateOnly: boolean,
  }): void {
    this.currentState.value = scenario.newState;
    let handlers = this.getRegisteredHandlers();
    if (scenario.immediateOnly) {
      handlers = handlers.filter((args) => args[1]?.immediate === true);
    }
    const callbacks = handlers.map((args) => args[0]);
    if (!callbacks.length) {
      throw new Error('No handler callbacks are registered to handle state change');
    }
    callbacks.forEach(
      (handler) => handler(scenario.newState, undefined),
    );
  }

  public get(): ReturnType<typeof useCollectionState> {
    return {
      modifyCurrentState: this.modifyCurrentState.bind(this),
      modifyCurrentContext: this.modifyCurrentContext.bind(this),
      onStateChange: this.onStateChange.bind(this),
      currentContext: this.currentContext,
      currentState: this.currentState,
    };
  }

  private onStateChange(
    handler: NewStateEventHandler,
    settings?: Partial<IStateCallbackSettings>,
  ) {
    if (settings?.immediate) {
      handler(this.currentState.value, undefined);
    }
    this.registerMethodCall({
      methodName: 'onStateChange',
      args: [handler, settings],
    });
  }

  private modifyCurrentState(mutator: StateModifier) {
    mutator(this.currentState.value);
    this.registerMethodCall({
      methodName: 'modifyCurrentState',
      args: [mutator],
    });
  }

  private modifyCurrentContext(mutator: ContextModifier) {
    mutator(this.currentContext);
    this.registerMethodCall({
      methodName: 'modifyCurrentContext',
      args: [mutator],
    });
  }

  private getRegisteredHandlers(): readonly Parameters<ReturnType<typeof useCollectionState>['onStateChange']>[] {
    const calls = this.callHistory.filter((call) => call.methodName === 'onStateChange');
    return calls.map((handler) => {
      const [callback, settings] = handler.args;
      return [
        callback as NewStateEventHandler,
        settings as Partial<IStateCallbackSettings>,
      ];
    });
  }
}
