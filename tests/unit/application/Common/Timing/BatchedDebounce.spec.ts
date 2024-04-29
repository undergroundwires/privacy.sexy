import { describe, it, expect } from 'vitest';
import { batchedDebounce } from '@/application/Common/Timing/BatchedDebounce';
import { TimerStub } from '@tests/unit/shared/Stubs/TimerStub';

describe('batchedDebounce', () => {
  describe('immediate invocation', () => {
    it('does not call the callback immediately on the first call', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const callArg = 'first';
      const debounceFunc = batchedDebounce(callback, 100, new TimerStub());

      // act
      debounceFunc(callArg);

      // assert
      expect(calledBatches).to.have.lengthOf(0);
    });
  });

  describe('debounce timing', () => {
    it('executes the callback after the debounce period', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const expectedArg = 'first';
      const debouncePeriodInMs = 100;
      const timer = new TimerStub();
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc(expectedArg);
      timer.tickNext(debouncePeriodInMs);

      // assert
      expect(calledBatches).to.have.lengthOf(1);
      expect(calledBatches).to.deep.include([expectedArg]);
    });
    it('prevents callback invocation within the debounce period', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const debouncePeriodInMs = 100;
      const timer = new TimerStub();
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc('first');
      timer.tickNext(debouncePeriodInMs / 4);
      debounceFunc('second');
      timer.tickNext(debouncePeriodInMs / 4);
      debounceFunc('third');
      timer.tickNext(debouncePeriodInMs / 4);

      // assert
      expect(calledBatches).to.have.lengthOf(0);
    });
    it('resets debounce timer on subsequent calls', () => {
      // arrange
      const timer = new TimerStub();
      const { calledBatches, callback } = createObservableCallback();
      const debouncePeriodInMs = 100;
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc('first');
      timer.tickNext(debouncePeriodInMs * 0.9);
      debounceFunc('second');
      timer.tickNext(debouncePeriodInMs * 0.9);
      debounceFunc('third');
      timer.tickNext(debouncePeriodInMs * 0.9);

      // assert
      expect(calledBatches).to.have.lengthOf(0);
    });
    it('does not call the callback again if no new calls are made after the debounce period', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const debouncePeriodInMs = 100;
      const timer = new TimerStub();
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc('first');
      timer.tickNext(debouncePeriodInMs);
      timer.tickNext(debouncePeriodInMs);
      timer.tickNext(debouncePeriodInMs);
      timer.tickNext(debouncePeriodInMs);

      // assert
      expect(calledBatches).to.have.lengthOf(1);
    });
  });

  describe('batching calls', () => {
    it('batches multiple calls within the debounce period', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const firstCallArg = 'first';
      const secondCallArg = 'second';
      const debouncePeriodInMs = 100;
      const timer = new TimerStub();
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc(firstCallArg);
      debounceFunc(secondCallArg);
      timer.tickNext(debouncePeriodInMs);

      // assert
      expect(calledBatches).to.have.lengthOf(1);
      expect(calledBatches).to.deep.include([firstCallArg, secondCallArg]);
    });
    it('handles multiple separate batches correctly', () => {
      // arrange
      const { calledBatches, callback } = createObservableCallback();
      const debouncePeriodInMs = 100;
      const firstBatchArg = 'first';
      const secondBatchArg = 'second';
      const timer = new TimerStub();
      const debounceFunc = batchedDebounce(callback, debouncePeriodInMs, timer);

      // act
      debounceFunc(firstBatchArg);
      timer.tickNext(debouncePeriodInMs);
      debounceFunc(secondBatchArg);
      timer.tickNext(debouncePeriodInMs);

      // assert
      expect(calledBatches).to.have.lengthOf(2);
      expect(calledBatches[0]).to.deep.equal([firstBatchArg]);
      expect(calledBatches[1]).to.deep.equal([secondBatchArg]);
    });
  });
});

function createObservableCallback() {
  const calledBatches = new Array<readonly string[]>();
  const callback = (batches: readonly string[]): void => {
    calledBatches.push(batches);
  };
  return {
    calledBatches,
    callback,
  };
}
