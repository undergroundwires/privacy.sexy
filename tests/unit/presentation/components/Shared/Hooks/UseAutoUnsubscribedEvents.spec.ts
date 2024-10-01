import { describe, it, expect } from 'vitest';
import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { EventSubscriptionCollectionStub } from '@tests/unit/shared/Stubs/EventSubscriptionCollectionStub';
import { EventSubscriptionStub } from '@tests/unit/shared/Stubs/EventSubscriptionStub';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import type { FunctionKeys } from '@/TypeHelpers';
import type { LifecycleHook } from '@/presentation/components/Shared/Hooks/Common/LifecycleHook';
import { LifecycleHookStub } from '@tests/unit/shared/Stubs/LifecycleHookStub';
import type { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';

describe('UseAutoUnsubscribedEvents', () => {
  describe('event collection handling', () => {
    it('returns the provided event collection when initialized', () => {
      // arrange
      const expectedEvents = new EventSubscriptionCollectionStub();
      const context = new TestContext()
        .withEvents(expectedEvents);

      // act
      const { events: actualEvents } = context.use();

      // assert
      expect(actualEvents).to.equal(expectedEvents);
    });

    it('throws error when there are existing subscriptions', () => {
      // arrange
      const expectedError = 'there are existing subscriptions, this may lead to side-effects';
      const events = new EventSubscriptionCollectionStub();
      events.register([new EventSubscriptionStub(), new EventSubscriptionStub()]);
      const context = new TestContext()
        .withEvents(events);

      // act
      const act = () => context.use();

      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('event unsubscription', () => {
    it('unsubscribes from all events when the associated component is unmounted', () => {
      // arrange
      const events = new EventSubscriptionCollectionStub();
      const expectedCall: FunctionKeys<EventSubscriptionCollection> = 'unsubscribeAll';
      const onTeardown = new LifecycleHookStub();
      const context = new TestContext()
        .withEvents(events)
        .withOnTeardown(onTeardown.getHook());

      // act
      context.use();
      events.register([new EventSubscriptionStub(), new EventSubscriptionStub()]);
      events.callHistory.length = 0;
      onTeardown.executeAllCallbacks();

      // assert
      expect(onTeardown.totalRegisteredCallbacks).to.be.greaterThan(0);
      expect(events.callHistory).to.have.lengthOf(1);
      expect(events.callHistory[0].methodName).to.equal(expectedCall);
    });
  });
});

class TestContext {
  private onTeardown: LifecycleHook = new LifecycleHookStub().getHook();

  private events: IEventSubscriptionCollection = new EventSubscriptionCollectionStub();

  public withOnTeardown(onTeardown: LifecycleHook): this {
    this.onTeardown = onTeardown;
    return this;
  }

  public withEvents(events: IEventSubscriptionCollection): this {
    this.events = events;
    return this;
  }

  public use(): ReturnType<typeof useAutoUnsubscribedEvents> {
    return useAutoUnsubscribedEvents(
      this.events,
      this.onTeardown,
    );
  }
}
