import { shallowRef, shallowReadonly } from 'vue';
import { IApplicationContext, IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';

export function useCollectionState(
  context: IApplicationContext,
  events: IEventSubscriptionCollection,
) {
  if (!context) {
    throw new Error('missing context');
  }
  if (!events) {
    throw new Error('missing events');
  }

  const currentState = shallowRef<IReadOnlyCategoryCollectionState>(context.state);
  events.register([
    context.contextChanged.on((event) => {
      currentState.value = event.newState;
    }),
  ]);

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
    events.register([
      context.contextChanged.on((event) => {
        handler(event.newState, event.oldState);
      }),
    ]);
    const defaultedSettings: IStateCallbackSettings = {
      ...defaultSettings,
      ...settings,
    };
    if (defaultedSettings.immediate) {
      handler(context.state, undefined);
    }
  }

  function modifyCurrentState(mutator: StateModifier) {
    if (!mutator) {
      throw new Error('missing state mutator');
    }
    mutator(context.state);
  }

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
    currentState: shallowReadonly(currentState),
  };
}

export type NewStateEventHandler = (
  newState: IReadOnlyCategoryCollectionState,
  oldState: IReadOnlyCategoryCollectionState | undefined,
) => void;

export interface IStateCallbackSettings {
  readonly immediate: boolean;
}

export type StateModifier = (
  state: ICategoryCollectionState,
) => void;

export type ContextModifier = (
  state: IApplicationContext,
) => void;
