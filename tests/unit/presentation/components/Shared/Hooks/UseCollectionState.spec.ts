import { describe, it, expect } from 'vitest';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { ApplicationContextStub } from '@tests/unit/shared/Stubs/ApplicationContextStub';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ApplicationContextChangedEventStub } from '@tests/unit/shared/Stubs/ApplicationContextChangedEventStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { IApplicationContext } from '@/application/Context/IApplicationContext';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import { EventSubscriptionCollectionStub } from '@tests/unit/shared/Stubs/EventSubscriptionCollectionStub';

describe('UseCollectionState', () => {
  describe('parameter validation', () => {
    describe('absent context', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing context';
        const contextValue = absentValue;
        // act
        const act = () => new UseCollectionStateBuilder()
          .withContext(contextValue)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('absent events', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing events';
        const eventsValue = absentValue;
        // act
        const act = () => new UseCollectionStateBuilder()
          .withEvents(eventsValue)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });

  describe('listens to contextChanged event', () => {
    it('registers new event listener', () => {
      // arrange
      const events = new EventSubscriptionCollectionStub();
      const expectedSubscriptionsCount = 1;
      // act
      new UseCollectionStateBuilder()
        .withEvents(events)
        .build();
      // assert
      const actualSubscriptionsCount = events.subscriptionCount;
      expect(actualSubscriptionsCount).to.equal(expectedSubscriptionsCount);
    });
    it('does not modify the state after event listener is unsubscribed', () => {
      // arrange
      const events = new EventSubscriptionCollectionStub();
      const oldState = new CategoryCollectionStateStub();
      const newState = new CategoryCollectionStateStub();
      const context = new ApplicationContextStub()
        .withState(oldState);

      // act
      const { currentState } = new UseCollectionStateBuilder()
        .withContext(context)
        .withEvents(events)
        .build();
      const stateModifierEvent = events.mostRecentSubscription;
      stateModifierEvent.unsubscribe();
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withNewState(newState),
      );

      // assert
      expect(currentState.value).to.equal(oldState);
    });
  });

  describe('currentContext', () => {
    it('returns current context', () => {
      // arrange
      const expectedContext = new ApplicationContextStub();

      // act
      const { currentContext } = new UseCollectionStateBuilder()
        .withContext(expectedContext)
        .build();

      // assert
      expect(currentContext).to.equal(expectedContext);
    });
  });

  describe('currentState', () => {
    it('returns current collection state', () => {
      // arrange
      const expected = new CategoryCollectionStateStub();
      const context = new ApplicationContextStub()
        .withState(expected);

      // act
      const { currentState } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // assert
      expect(currentState.value).to.equal(expected);
    });
    it('returns changed collection state', () => {
      // arrange
      const expectedNewState = new CategoryCollectionStateStub();
      const context = new ApplicationContextStub();
      const { currentState } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // act
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withNewState(expectedNewState),
      );

      // assert
      expect(currentState.value).to.equal(expectedNewState);
    });
  });

  describe('onStateChange', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing state handler';
        const { onStateChange } = new UseCollectionStateBuilder().build();
        // act
        const act = () => onStateChange(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('call handler when context state changes', () => {
      // arrange
      const expected = true;
      const context = new ApplicationContextStub();
      const { onStateChange } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      });
      context.dispatchContextChange();

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('call handler immediately when immediate is true', () => {
      // arrange
      const expected = true;
      const { onStateChange } = new UseCollectionStateBuilder().build();
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      }, { immediate: true });

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('does not call handler immediately when immediate is false', () => {
      // arrange
      const expected = false;
      const { onStateChange } = new UseCollectionStateBuilder().build();
      let wasCalled = false;

      // act
      onStateChange(() => {
        wasCalled = true;
      }, { immediate: false });

      // assert
      expect(wasCalled).to.equal(expected);
    });
    it('call multiple handlers when context state changes', () => {
      // arrange
      const expected = 5;
      const context = new ApplicationContextStub();
      const { onStateChange } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();
      let totalCalled = 0;

      // act
      onStateChange(() => {
        totalCalled++;
      }, { immediate: false });
      for (let i = 0; i < expected; i++) {
        context.dispatchContextChange();
      }

      // assert
      expect(totalCalled).to.equal(expected);
    });
    it('call handler with new state after state changes', () => {
      // arrange
      const expected = new CategoryCollectionStateStub();
      let actual: IReadOnlyCategoryCollectionState;
      const context = new ApplicationContextStub();
      const { onStateChange } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // act
      onStateChange((newState) => {
        actual = newState;
      });
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withNewState(expected),
      );

      // assert
      expect(actual).to.equal(expected);
    });
    it('call handler with old state after state changes', () => {
      // arrange
      const expectedState = new CategoryCollectionStateStub();
      let actualState: IReadOnlyCategoryCollectionState;
      const context = new ApplicationContextStub();
      const { onStateChange } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // act
      onStateChange((_, oldState) => {
        actualState = oldState;
      });
      context.dispatchContextChange(
        new ApplicationContextChangedEventStub().withOldState(expectedState),
      );

      // assert
      expect(actualState).to.equal(expectedState);
    });
    describe('listens to contextChanged event', () => {
      it('registers new event listener', () => {
        // arrange
        const events = new EventSubscriptionCollectionStub();
        const { onStateChange } = new UseCollectionStateBuilder()
          .withEvents(events)
          .build();
        const expectedSubscriptionsCount = 1;
        // act
        events.unsubscribeAll(); // clean count for event subscriptions before
        onStateChange(() => { /* NO OP */ });
        // assert
        const actualSubscriptionsCount = events.subscriptionCount;
        expect(actualSubscriptionsCount).to.equal(expectedSubscriptionsCount);
      });
      it('onStateChange is not called once event is unsubscribed', () => {
        // arrange
        let isCallbackCalled = false;
        const callback = () => { isCallbackCalled = true; };
        const context = new ApplicationContextStub();
        const events = new EventSubscriptionCollectionStub();
        const { onStateChange } = new UseCollectionStateBuilder()
          .withEvents(events)
          .withContext(context)
          .build();
        // act
        onStateChange(callback);
        const stateChangeEvent = events.mostRecentSubscription;
        stateChangeEvent.unsubscribe();
        context.dispatchContextChange();
        // assert
        expect(isCallbackCalled).to.equal(false);
      });
    });
  });

  describe('modifyCurrentState', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing state mutator';
        const context = new ApplicationContextStub();
        const { modifyCurrentState } = new UseCollectionStateBuilder()
          .withContext(context)
          .build();

        // act
        const act = () => modifyCurrentState(absentValue);

        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('modifies current collection state', () => {
      // arrange
      const oldOs = OperatingSystem.Windows;
      const newOs = OperatingSystem.Linux;
      const state = new CategoryCollectionStateStub()
        .withOs(oldOs);
      const context = new ApplicationContextStub()
        .withState(state);
      const { modifyCurrentState } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // act
      modifyCurrentState((mutableState) => {
        const stubState = (mutableState as CategoryCollectionStateStub);
        stubState.withOs(newOs);
      });
      const actualOs = context.state.collection.os;

      // assert
      expect(actualOs).to.equal(newOs);
    });
  });

  describe('modifyCurrentContext', () => {
    describe('throws when callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing context mutator';
        const { modifyCurrentContext } = new UseCollectionStateBuilder().build();
        // act
        const act = () => modifyCurrentContext(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('modifies the current context', () => {
      // arrange
      const oldState = new CategoryCollectionStateStub()
        .withOs(OperatingSystem.Linux);
      const newState = new CategoryCollectionStateStub()
        .withOs(OperatingSystem.macOS);
      const context = new ApplicationContextStub()
        .withState(oldState);
      const { modifyCurrentContext } = new UseCollectionStateBuilder()
        .withContext(context)
        .build();

      // act
      modifyCurrentContext((mutableContext) => {
        const contextStub = mutableContext as ApplicationContextStub;
        contextStub.withState(newState);
      });
      const actualState = context.state;

      // assert
      expect(actualState).to.equal(newState);
    });
  });
});

class UseCollectionStateBuilder {
  private context: IApplicationContext = new ApplicationContextStub();

  private events: IEventSubscriptionCollection = new EventSubscriptionCollectionStub();

  public withContext(context: IApplicationContext): this {
    this.context = context;
    return this;
  }

  public withEvents(events: IEventSubscriptionCollection): this {
    this.events = events;
    return this;
  }

  public build(): ReturnType<typeof useCollectionState> {
    return useCollectionState(this.context, this.events);
  }
}
