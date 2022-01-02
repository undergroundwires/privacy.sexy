import 'mocha';
import { expect } from 'chai';
import { sleep, SchedulerType, SchedulerCallbackType } from '@/infrastructure/Threading/AsyncSleep';

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

function flushPromiseResolutionQueue() {
  return Promise.resolve();
}

class SchedulerMock {
  public readonly mock: SchedulerType;

  private currentTime = 0;

  private scheduledActions = new Array<{time: number, action: SchedulerCallbackType}>();

  constructor() {
    this.mock = (callback: SchedulerCallbackType, ms: number) => {
      this.scheduledActions.push({ time: this.currentTime + ms, action: callback });
    };
  }

  public tickNext(ms: number) {
    const newTime = this.currentTime + ms;
    let newActions = this.scheduledActions;
    for (const action of this.scheduledActions) {
      if (newTime >= action.time) {
        newActions = newActions.filter((a) => a !== action);
        action.action();
      }
    }
    this.scheduledActions = newActions;
  }
}

function watchPromiseState<T>(promise: Promise<T>) {
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;
  promise.then(
    () => {
      isFulfilled = true;
      isPending = false;
    },
    () => {
      isRejected = true;
      isPending = false;
    },
  );
  return {
    isFulfilled: () => isFulfilled,
    isPending: () => isPending,
    isRejected: () => isRejected,
  };
}
