import { describe, it, expect } from 'vitest';
import { TimerStub } from '@tests/unit/shared/Stubs/TimerStub';
import { throttle, type ThrottleFunction, type ThrottleOptions } from '@/application/Common/Timing/Throttle';
import type { Timer } from '@/application/Common/Timing/Timer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('throttle', () => {
  describe('parameter validation', () => {
    describe('throws for invalid waitInMs', () => {
      const testCases: readonly {
        readonly description: string;
        readonly value: number;
        readonly expectedError: string;
      }[] = [
        {
          description: 'given zero',
          value: 0,
          expectedError: 'missing delay',
        },
        {
          description: 'given negative',
          value: -2,
          expectedError: 'negative delay',
        },
      ];
      testCases.forEach((
        { description, expectedError, value: waitInMs },
      ) => {
        it(`"${description}" throws "${expectedError}"`, () => {
          // arrange
          const context = new TestContext()
            .withWaitInMs(waitInMs);
          // act
          const act = () => context.throttle();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
  });
  it('executes the leading callback immediately', () => {
    // arrange
    const timer = new TimerStub();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const throttleFunc = new TestContext()
      .withTimer(timer)
      .withCallback(callback)
      .throttle();

    // act
    throttleFunc();

    // assert
    expect(totalRuns).to.equal(1);
  });
  it('executes the leading callback with initial arguments', () => {
    // arrange
    const expectedArguments = [1, 2, 3];
    const timer = new TimerStub();
    let lastArgs: readonly number[] | null = null;
    const callback = (...args: readonly number[]) => { lastArgs = args; };
    const waitInMs = 500;
    const throttleFunc = new TestContext()
      .withWaitInMs(waitInMs)
      .withTimer(timer)
      .withCallback(callback)
      .throttle();

    // act
    throttleFunc(...expectedArguments);
    timer.tickNext(waitInMs / 3);
    throttleFunc(4, 5, 6);
    timer.tickNext(waitInMs / 3);
    throttleFunc(7, 8, 9);

    // assert
    expect(lastArgs).to.deep.equal(expectedArguments);
  });
  it('executes the trailing callback with final arguments', () => {
    // arrange
    const expectedArguments = [1, 2, 3];
    const timer = new TimerStub();
    let lastArgs: readonly number[] | null = null;
    const callback = (...args: readonly number[]) => { lastArgs = args; };
    const waitInMs = 500;
    const throttleFunc = new TestContext()
      .withWaitInMs(waitInMs)
      .withTimer(timer)
      .withCallback(callback)
      .throttle();

    // act
    throttleFunc(1, 2, 3);
    timer.tickNext(100);
    throttleFunc(4, 5, 6);
    timer.tickNext(100);
    throttleFunc(lastArgs);

    // assert
    expect(lastArgs).to.deep.equal(expectedArguments);
  });
  it('executes the callback after the delay', () => {
    // arrange
    const timer = new TimerStub();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 500;
    const throttleFunc = new TestContext()
      .withWaitInMs(waitInMs)
      .withTimer(timer)
      .withCallback(callback)
      .throttle();
    // act
    throttleFunc();
    totalRuns--; // So we don't count the initial run
    throttleFunc();
    timer.tickNext(waitInMs);
    // assert
    expect(totalRuns).to.equal(1);
  });
  it('limits calls to at most once per period', () => {
    // arrange
    const totalExpectedCalls = 2; // leading and trailing only
    const timer = new TimerStub();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 200;
    const totalCalls = 10;
    const throttleFunc = new TestContext()
      .withWaitInMs(waitInMs)
      .withTimer(timer)
      .withCallback(callback)
      .throttle();
    // act
    for (let currentCall = 0; currentCall < totalCalls; currentCall++) {
      const currentTime = (waitInMs / totalCalls) * currentCall;
      timer.setCurrentTime(currentTime);
      throttleFunc();
    }
    timer.tickNext(waitInMs);
    // assert
    expect(totalRuns).to.equal(totalExpectedCalls);
  });
  it('executes the callback after each complete delay period', () => {
    // arrange
    const timer = new TimerStub();
    let totalRuns = 0;
    const callback = () => totalRuns++;
    const waitInMs = 500;
    const expectedTotalRuns = 10;
    const throttleFunc = new TestContext()
      .withWaitInMs(waitInMs)
      .withTimer(timer)
      .withCallback(callback)
      .throttle();
    // act
    Array.from({ length: expectedTotalRuns }).forEach(() => {
      throttleFunc();
      timer.tickNext(waitInMs);
    });
    // assert
    expect(totalRuns).to.equal(expectedTotalRuns);
  });
  describe('leading call exclusion', () => {
    it('does not execute the callback immediately on the first call', () => {
      // arrange
      const timer = new TimerStub();
      let totalRuns = 0;
      const callback = () => totalRuns++;
      const throttleFunc = new TestContext()
        .withTimer(timer)
        .withCallback(callback)
        .withExcludeLeadingCall(true)
        .throttle();
      // act
      throttleFunc();
      // assert
      expect(totalRuns).to.equal(0);
    });
    it('executes the initial call after the initial wait time', () => {
      // arrange
      const timer = new TimerStub();
      let totalRuns = 0;
      const waitInMs = 200;
      const callback = () => totalRuns++;
      const throttleFunc = new TestContext()
        .withTimer(timer)
        .withCallback(callback)
        .withExcludeLeadingCall(true)
        .withWaitInMs(waitInMs)
        .throttle();
      // act
      throttleFunc();
      timer.tickNext(waitInMs);
      // assert
      expect(totalRuns).to.equal(1);
    });
    it('executes two calls after two wait periods', () => {
      // arrange
      const expectedTotalRuns = 2;
      const calledArgs = new Array<string>();
      const timer = new TimerStub();
      const waitInMs = 300;
      let totalRuns = 0;
      const callback = (message: string) => {
        totalRuns++;
        calledArgs.push(message);
      };
      const throttleFunc = new TestContext()
        .withTimer(timer)
        .withCallback(callback)
        .withWaitInMs(waitInMs)
        .withExcludeLeadingCall(true)
        .throttle();
      // act
      Array.from({ length: expectedTotalRuns }).forEach((_, index) => {
        throttleFunc(`Call ${index} (zero-based, where initial call is 0)`);
        timer.tickNext(waitInMs);
      });
      // assert
      expect(totalRuns).to.equal(expectedTotalRuns, formatAssertionMessage([
        `Expected total runs to equal ${expectedTotalRuns}, but got ${totalRuns}.`,
        'Detailed call information:',
        ...calledArgs.map((message, index) => `${index + 1}) ${message}`),
      ]));
    });
    it('only executes once when multiple calls are made during the initial wait period', () => {
      // arrange
      const timer = new TimerStub();
      let totalRuns = 0;
      const callback = () => { totalRuns++; };
      const waitInMs = 300;
      const throttleFunc = new TestContext()
        .withTimer(timer)
        .withWaitInMs(waitInMs)
        .withCallback(callback)
        .withExcludeLeadingCall(true)
        .throttle();
      // act
      throttleFunc();
      timer.tickNext(waitInMs / 3);
      throttleFunc();
      timer.tickNext(waitInMs / 3);
      throttleFunc();
      timer.tickNext(waitInMs / 3);
      // assert
      expect(totalRuns).to.equal(1);
    });
    it('executes the last provided arguments only after the wait period expires', () => {
      // arrange
      const expectedLastArg = 'trailing call';
      const timer = new TimerStub();
      let actualLastArg: string | null = null;
      const callback = (arg: string) => {
        actualLastArg = arg;
      };
      const waitInMs = 300;
      const throttleFunc = new TestContext()
        .withTimer(timer)
        .withWaitInMs(waitInMs)
        .withCallback(callback)
        .withExcludeLeadingCall(true)
        .throttle();
      // act
      throttleFunc('leading call');
      timer.tickNext(waitInMs / 3);
      throttleFunc('call in the middle');
      timer.tickNext(waitInMs / 3);
      throttleFunc(expectedLastArg);
      timer.tickNext(waitInMs / 3);
      // assert
      expect(actualLastArg).to.equal(expectedLastArg);
    });
  });
});

type CallbackType = Parameters<ThrottleFunction>[0];

class TestContext {
  private options: Partial<ThrottleOptions> | undefined = {
    timer: new TimerStub(),
  };

  private waitInMs: number = 500;

  private callback: CallbackType = () => { /* NO OP */ };

  public withTimer(timer: Timer): this {
    return this.withOptions({
      ...(this.options ?? {}),
      timer,
    });
  }

  public withWaitInMs(waitInMs: number): this {
    this.waitInMs = waitInMs;
    return this;
  }

  public withCallback(callback: CallbackType): this {
    this.callback = callback;
    return this;
  }

  public withExcludeLeadingCall(excludeLeadingCall: boolean): this {
    return this.withOptions({
      ...(this.options ?? {}),
      excludeLeadingCall,
    });
  }

  public withOptions(options: Partial<ThrottleOptions> | undefined): this {
    this.options = options;
    return this;
  }

  public throttle(): ReturnType<ThrottleFunction> {
    return throttle(
      this.callback,
      this.waitInMs,
      this.options,
    );
  }
}
