import { shallowRef } from 'vue';
import {
  ContextModifier, IStateCallbackSettings, NewStateEventHandler,
  StateModifier, useCollectionState,
} from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { CategoryCollectionStateStub } from './CategoryCollectionStateStub';
import { ApplicationContextStub } from './ApplicationContextStub';
import { UserFilterStub } from './UserFilterStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class UseCollectionStateStub
  extends StubWithObservableMethodCalls<ReturnType<typeof useCollectionState>> {
  private currentContext: IApplicationContext = new ApplicationContextStub();

  private readonly currentState = shallowRef<ICategoryCollectionState>(
    new CategoryCollectionStateStub(),
  );

  public withFilter(filter: IUserFilter) {
    const state = new CategoryCollectionStateStub()
      .withFilter(filter);
    const context = new ApplicationContextStub()
      .withState(state);
    return new UseCollectionStateStub()
      .withState(state)
      .withContext(context);
  }

  public withFilterResult(filterResult: IFilterResult | undefined) {
    const filter = new UserFilterStub()
      .withCurrentFilterResult(filterResult);
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
    const callbacks = handlers.map((args) => args[0] as NewStateEventHandler);
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
