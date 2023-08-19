import { ref, computed, readonly } from 'vue';
import { IApplicationContext, IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';

export function useCollectionState(context: IApplicationContext) {
  if (!context) {
    throw new Error('missing context');
  }

  const events = new EventSubscriptionCollection();
  const ownEvents = new EventSubscriptionCollection();

  const currentState = ref<ICategoryCollectionState>(context.state);
  ownEvents.register(
    context.contextChanged.on((event) => {
      currentState.value = event.newState;
    }),
  );

  type NewStateEventHandler = (
    newState: IReadOnlyCategoryCollectionState,
    oldState: IReadOnlyCategoryCollectionState | undefined,
  ) => void;
  interface IStateCallbackSettings {
    readonly immediate: boolean;
  }
  const defaultSettings: IStateCallbackSettings = {
    immediate: false,
  };
  function onStateChange(
    handler: NewStateEventHandler,
    settings: Partial<IStateCallbackSettings> = defaultSettings,
  ) {
    if (!handler) {
      throw new Error('missing state handler');
    }
    ownEvents.register(
      context.contextChanged.on((event) => {
        handler(event.newState, event.oldState);
      }),
    );
    const defaultedSettings: IStateCallbackSettings = {
      ...defaultSettings,
      ...settings,
    };
    if (defaultedSettings.immediate) {
      handler(context.state, undefined);
    }
  }

  type StateModifier = (
    state: ICategoryCollectionState,
  ) => void;
  function modifyCurrentState(mutator: StateModifier) {
    if (!mutator) {
      throw new Error('missing state mutator');
    }
    mutator(context.state);
  }

  type ContextModifier = (
    state: IApplicationContext,
  ) => void;
  function modifyCurrentContext(mutator: ContextModifier) {
    if (!mutator) {
      throw new Error('missing context mutator');
    }
    mutator(context);
  }

  return {
    modifyCurrentState,
    modifyCurrentContext,
    onStateChange,
    currentContext: context as IReadOnlyApplicationContext,
    currentState: readonly(computed<IReadOnlyCategoryCollectionState>(() => currentState.value)),
    events,
  };
}
