import { describe, it, expect } from 'vitest';
import { TimerStub } from '@tests/unit/shared/Stubs/TimerStub';
import { throttle } from '@/application/Common/Timing/Throttle';

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
    const timer = new TimerStub();
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
    const timer = new TimerStub();
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
    const timer = new TimerStub();
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
    const timer = new TimerStub();
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
    const timer = new TimerStub();
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
