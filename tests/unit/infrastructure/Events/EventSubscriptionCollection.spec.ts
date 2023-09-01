import { describe, it, expect } from 'vitest';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import { EventSubscriptionStub } from '@tests/unit/shared/Stubs/EventSubscriptionStub';
import { itEachAbsentCollectionValue, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

describe('EventSubscriptionCollection', () => {
  describe('register', () => {
    it('increments `subscriptionCount` for each registration', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const subscriptions = createSubscriptionStubList(2);

      // act
      sut.register(subscriptions);

      // assert
      expect(sut.subscriptionCount).to.equal(2);
    });
    it('retains the subscribed state of registrations', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const subscriptions = createSubscriptionStubList(2);

      // act
      sut.register(subscriptions);

      // assert
      expectAllSubscribed(subscriptions);
    });
    describe('validation', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      // act
      const act = (
        subscriptions: IEventSubscription[],
      ) => sut.register(subscriptions);
      /// assert
      describeSubscriptionValidations(act);
    });
  });
  describe('unsubscribeAll', () => {
    it('unsubscribes all registrations', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const subscriptions = createSubscriptionStubList(2);

      // act
      sut.register(subscriptions);
      sut.unsubscribeAll();

      // assert
      expectAllUnsubscribed(subscriptions);
    });
    it('resets `subscriptionCount` to zero', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const subscriptions = createSubscriptionStubList(2);
      sut.register(subscriptions);

      // act
      sut.unsubscribeAll();

      // assert
      expect(sut.subscriptionCount).to.equal(0);
    });
  });
  describe('unsubscribeAllAndRegister', () => {
    it('unsubscribes all previous registrations', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const oldSubscriptions = createSubscriptionStubList(2);
      sut.register(oldSubscriptions);
      const newSubscriptions = createSubscriptionStubList(1);

      // act
      sut.unsubscribeAllAndRegister(newSubscriptions);

      // assert
      expectAllUnsubscribed(oldSubscriptions);
    });
    it('retains the subscribed state of new registrations', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const oldSubscriptions = createSubscriptionStubList(2);
      sut.register(oldSubscriptions);
      const newSubscriptions = createSubscriptionStubList(2);

      // act
      sut.unsubscribeAllAndRegister(newSubscriptions);

      // assert
      expectAllSubscribed(newSubscriptions);
    });
    it('updates `subscriptionCount` to match new registration count', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      const initialSubscriptionAmount = 1;
      const expectedSubscriptionAmount = 3;
      const oldSubscriptions = createSubscriptionStubList(initialSubscriptionAmount);
      sut.register(oldSubscriptions);
      const newSubscriptions = createSubscriptionStubList(expectedSubscriptionAmount);

      // act
      sut.unsubscribeAllAndRegister(newSubscriptions);

      // assert
      expect(sut.subscriptionCount).to.equal(expectedSubscriptionAmount);
    });

    describe('validation', () => {
      // arrange
      const sut = new EventSubscriptionCollection();
      // act
      const act = (
        subscriptions: IEventSubscription[],
      ) => sut.unsubscribeAllAndRegister(subscriptions);
      /// assert
      describeSubscriptionValidations(act);
    });
  });
});

function expectAllSubscribed(subscriptions: EventSubscriptionStub[]) {
  expect(subscriptions.every((subscription) => subscription.isSubscribed)).to.equal(true);
}

function expectAllUnsubscribed(subscriptions: EventSubscriptionStub[]) {
  expect(subscriptions.every((subscription) => subscription.isUnsubscribed)).to.equal(true);
}

function createSubscriptionStubList(amount: number): EventSubscriptionStub[] {
  if (amount <= 0) {
    throw new Error(`unexpected amount of subscriptions: ${amount}`);
  }
  return Array.from({ length: amount }, () => new EventSubscriptionStub());
}

function describeSubscriptionValidations(
  handleValue: (subscriptions: IEventSubscription[]) => void,
) {
  describe('throws error if no subscriptions are provided', () => {
    itEachAbsentCollectionValue((absentValue) => {
      // arrange
      const expectedError = 'missing subscriptions';

      // act
      const act = () => handleValue(absentValue);

      // assert
      expect(act).to.throw(expectedError);
    });
  });

  describe('throws error if nullish subscriptions are provided', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing subscription in list';
      const subscriptions = [
        new EventSubscriptionStub(),
        absentValue,
        new EventSubscriptionStub(),
      ];

      // act
      const act = () => handleValue(subscriptions);

      // assert
      expect(act).to.throw(expectedError);
    });
  });
}
