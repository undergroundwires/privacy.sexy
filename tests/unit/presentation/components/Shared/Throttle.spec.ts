import { describe, it, expect } from 'vitest';
import { throttle, ITimer, Timeout } from '@/presentation/components/Shared/Throttle';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { createMockTimeout } from '@tests/unit/shared/Stubs/TimeoutStub';

describe('throttle', () => {
  describe('validates parameters', () => {
    describe('throws if waitInMs is invalid', () => {
      // arrange
      const testCases = [
        {
          name: 'given zero',
          value: 0,
          expectedError: 'missing delay',
        },
        {
          name: 'given negative',
          value: -2,
          expectedError: 'negative delay',
        },
      ];
      const noopCallback = () => { /* do nothing */ };
      for (const testCase of testCases) {
        it(`"${testCase.name}" throws "${testCase.expectedError}"`, () => {
          // act
          const waitInMs = testCase.value;
          const act = () => throttle(noopCallback, waitInMs);
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
  });
  it('should call the callback immediately', () => {
    // arrange
    const timer = new TimerMock();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const throttleFunc = throttle(callback, 500, timer);
    // act
    throttleFunc();
    // assert
    expect(totalRuns).to.equal(1);
  });
  it('should call the callback again after the timeout', () => {
    // arrange
    const timer = new TimerMock();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 500;
    const throttleFunc = throttle(callback, waitInMs, timer);
    // act
    throttleFunc();
    totalRuns--; // So we don't count the initial run
    throttleFunc();
    timer.tickNext(waitInMs);
    // assert
    expect(totalRuns).to.equal(1);
  });
  it('should call the callback at most once at given time', () => {
    // arrange
    const timer = new TimerMock();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 500;
    const totalCalls = 10;
    const throttleFunc = throttle(callback, waitInMs, timer);
    // act
    for (let currentCall = 0; currentCall < totalCalls; currentCall++) {
      const currentTime = (waitInMs / totalCalls) * currentCall;
      timer.setCurrentTime(currentTime);
      throttleFunc();
    }
    // assert
    expect(totalRuns).to.equal(2); // one initial and one at the end
  });
  it('should call the callback as long as delay is waited', () => {
    // arrange
    const timer = new TimerMock();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 500;
    const expectedTotalRuns = 10;
    const throttleFunc = throttle(callback, waitInMs, timer);
    // act
    for (let i = 0; i < expectedTotalRuns; i++) {
      throttleFunc();
      timer.tickNext(waitInMs);
    }
    // assert
    expect(totalRuns).to.equal(expectedTotalRuns);
  });
  it('should call arguments as expected', () => {
    // arrange
    const timer = new TimerMock();
    const expected = [1, 2, 3];
    const actual = new Array<number>();
    const callback = (arg: number) => { actual.push(arg); };
    const waitInMs = 500;
    const throttleFunc = throttle(callback, waitInMs, timer);
    // act
    for (const arg of expected) {
      throttleFunc(arg);
      timer.tickNext(waitInMs);
    }
    // assert
    expect(expected).to.deep.equal(actual);
  });
});

class TimerMock implements ITimer {
  private timeChanged = new EventSource<number>();

  private subscriptions = new Array<IEventSubscription>();

  private currentTime = 0;

  public setTimeout(callback: () => void, ms: number): Timeout {
    const runTime = this.currentTime + ms;
    const subscription = this.timeChanged.on((time) => {
      if (time >= runTime) {
        callback();
        subscription.unsubscribe();
      }
    });
    this.subscriptions.push(subscription);
    const id = this.subscriptions.length - 1;
    return createMockTimeout(id);
  }

  public clearTimeout(timeoutId: Timeout): void {
    this.subscriptions[+timeoutId].unsubscribe();
  }

  public dateNow(): number {
    return this.currentTime;
  }

  public tickNext(ms: number): void {
    this.setCurrentTime(this.currentTime + ms);
  }

  public setCurrentTime(ms: number): void {
    this.currentTime = ms;
    this.timeChanged.notify(this.currentTime);
  }
}
