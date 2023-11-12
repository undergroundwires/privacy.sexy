import { shallowRef, shallowReadonly } from 'vue';
import { IApplicationContext, IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';

export function useCollectionState(
  context: IApplicationContext,
  events: IEventSubscriptionCollection,
) {
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
    mutator(context.state);
  }

  function modifyCurrentContext(mutator: ContextModifier) {
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
