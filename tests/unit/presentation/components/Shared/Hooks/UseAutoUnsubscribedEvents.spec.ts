import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { EventSubscriptionCollectionStub } from '@tests/unit/shared/Stubs/EventSubscriptionCollectionStub';
import { EventSubscriptionStub } from '@tests/unit/shared/Stubs/EventSubscriptionStub';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import type { FunctionKeys } from '@/TypeHelpers';

describe('UseAutoUnsubscribedEvents', () => {
  describe('event collection handling', () => {
    it('returns the provided event collection when initialized', () => {
      // arrange
      const expectedEvents = new EventSubscriptionCollectionStub();

      // act
      const { events: actualEvents } = useAutoUnsubscribedEvents(expectedEvents);

      // assert
      expect(actualEvents).to.equal(expectedEvents);
    });

    it('uses a default event collection when none is provided during initialization', () => {
      // arrange
      const expectedType = EventSubscriptionCollection;

      // act
      const { events: actualEvents } = useAutoUnsubscribedEvents();

      // assert
      expect(actualEvents).to.be.instanceOf(expectedType);
    });

    it('throws error when there are existing subscriptions', () => {
      // arrange
      const expectedError = 'there are existing subscriptions, this may lead to side-effects';
      const events = new EventSubscriptionCollectionStub();
      events.register([new EventSubscriptionStub(), new EventSubscriptionStub()]);

      // act
      const act = () => useAutoUnsubscribedEvents(events);

      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('event unsubscription', () => {
    it('unsubscribes from all events when the associated component is unmounted', () => {
      // arrange
      const events = new EventSubscriptionCollectionStub();
      const expectedCall: FunctionKeys<EventSubscriptionCollection> = 'unsubscribeAll';
      const stubComponent = shallowMount({
        setup() {
          useAutoUnsubscribedEvents(events);
          events.register([new EventSubscriptionStub(), new EventSubscriptionStub()]);
        },
        template: '<div></div>',
      });
      events.callHistory.length = 0;

      // act
      stubComponent.unmount();

      // assert
      expect(events.callHistory).to.have.lengthOf(1);
      expect(events.callHistory[0].methodName).to.equal(expectedCall);
    });
  });
});
