import { describe, it, expect } from 'vitest';
import { throttle, ITimer, TimeoutType } from '@/presentation/components/Shared/Throttle';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { getAbsentObjectTestCases, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('throttle', () => {
  describe('validates parameters', () => {
    describe('throws if callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing callback';
        const callback = absentValue;
        // act
        const act = () => throttle(callback, 500);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('throws if waitInMs is negative or zero', () => {
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
        ...getAbsentObjectTestCases().map((testCase) => ({
          name: `when absent (given ${testCase.valueName})`,
          value: testCase.absentValue,
          expectedError: 'missing delay',
        })),
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
    it('throws if timer is null', () => {
      // arrange
      const expectedError = 'missing timer';
      const timer = null;
      const noopCallback = () => { /* do nothing */ };
      const waitInMs = 1;
      // act
      const act = () => throttle(noopCallback, waitInMs, timer);
      // assert
      expect(act).to.throw(expectedError);
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

  public setTimeout(callback: () => void, ms: number): TimeoutType {
    const runTime = this.currentTime + ms;
    const subscription = this.timeChanged.on((time) => {
      if (time >= runTime) {
        callback();
        subscription.unsubscribe();
      }
    });
    this.subscriptions.push(subscription);
    const id = this.subscriptions.length - 1;
    return TimerMock.mockTimeout(id);
  }

  public clearTimeout(timeoutId: TimeoutType): void {
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

  private static mockTimeout(subscriptionId: number): TimeoutType {
    const throwNodeSpecificCode = () => { throw new Error('node specific code'); };
    return {
      [Symbol.toPrimitive]: () => subscriptionId,
      hasRef: throwNodeSpecificCode,
      refresh: throwNodeSpecificCode,
      ref: throwNodeSpecificCode,
      unref: throwNodeSpecificCode,
    };
  }
}
