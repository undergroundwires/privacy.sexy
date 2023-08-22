import { describe, it, expect } from 'vitest';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

describe('EventSubscriptionCollection', () => {
  it('unsubscribeAll unsubscribes from all registered subscriptions', () => {
    // arrange
    const sut = new EventSubscriptionCollection();
    const expected = ['unsubscribed1', 'unsubscribed2'];
    const actual = new Array<string>();
    const subscriptions: IEventSubscription[] = [
      { unsubscribe: () => actual.push(expected[0]) },
      { unsubscribe: () => actual.push(expected[1]) },
    ];
    // act
    sut.register(...subscriptions);
    sut.unsubscribeAll();
    // assert
    expect(actual).to.deep.equal(expected);
  });
});
