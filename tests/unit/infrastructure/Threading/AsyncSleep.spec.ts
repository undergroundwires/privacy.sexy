import { describe, it, expect } from 'vitest';
import { sleep, type SchedulerType, type SchedulerCallbackType } from '@/infrastructure/Threading/AsyncSleep';
import { flushPromiseResolutionQueue, watchPromiseState } from '@tests/unit/shared/PromiseInspection';

describe('AsyncSleep', () => {
  describe('sleep', () => {
    it('fulfills after delay', async () => {
      // arrange
      const delayInMs = 10;
      const scheduler = new SchedulerMock();
      // act
      const promise = sleep(delayInMs, scheduler.mock);
      const promiseState = watchPromiseState(promise);
      scheduler.tickNext(delayInMs);
      await flushPromiseResolutionQueue();
      // assert
      const actual = promiseState.isFulfilled();
      expect(actual).to.equal(true);
    });
    it('pending before delay', async () => {
      // arrange
      const delayInMs = 10;
      const scheduler = new SchedulerMock();
      // act
      const promise = sleep(delayInMs, scheduler.mock);
      const promiseState = watchPromiseState(promise);
      scheduler.tickNext(delayInMs / 5);
      await flushPromiseResolutionQueue();
      // assert
      const actual = promiseState.isPending();
      expect(actual).to.equal(true);
    });
  });
});

class SchedulerMock {
  public readonly mock: SchedulerType;

  private currentTime = 0;

  private scheduledActions = new Array<{ time: number, action: SchedulerCallbackType }>();

  constructor() {
    this.mock = (callback: SchedulerCallbackType, ms: number) => {
      this.scheduledActions.push({ time: this.currentTime + ms, action: callback });
    };
  }

  public tickNext(ms: number) {
    const newTime = this.currentTime + ms;
    const dueActions = this.scheduledActions
      .filter((action) => newTime >= action.time);
    for (const action of dueActions) {
      action.action();
    }
    this.scheduledActions = this.scheduledActions.filter((action) => !dueActions.includes(action));
  }
}
