import { describe, it, expect } from 'vitest';
import { type TimeFunctions, TimeoutDelayScheduler } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Scheduling/TimeoutDelayScheduler';
import { StubWithObservableMethodCalls } from '@tests/unit/shared/Stubs/StubWithObservableMethodCalls';
import { createMockTimeout } from '@tests/unit/shared/Stubs/TimeoutStub';

describe('TimeoutDelayScheduler', () => {
  describe('scheduleNext', () => {
    describe('when setting a new timeout', () => {
      it('sets callback correctly', () => {
        // arrange
        const timerStub = new TimeFunctionsStub();
        const scheduler = new TimeoutDelayScheduler(timerStub);
        const expectedCallback = () => { /* NO OP */ };
        // act
        scheduler.scheduleNext(expectedCallback, 3131);
        // assert
        const setTimeoutCalls = timerStub.callHistory.filter((c) => c.methodName === 'setTimeout');
        expect(setTimeoutCalls).to.have.lengthOf(1);
        const [actualCallback] = setTimeoutCalls[0].args;
        expect(actualCallback).toBe(expectedCallback);
      });
      it('sets delay correctly', () => {
        // arrange
        const timerStub = new TimeFunctionsStub();
        const scheduler = new TimeoutDelayScheduler(timerStub);
        const expectedDelay = 100;
        // act
        scheduler.scheduleNext(() => {}, expectedDelay);
        // assert
        const setTimeoutCalls = timerStub.callHistory.filter((c) => c.methodName === 'setTimeout');
        expect(setTimeoutCalls).to.have.lengthOf(1);
        const [,actualDelay] = setTimeoutCalls[0].args;
        expect(actualDelay).toBe(expectedDelay);
      });
      it('does not clear any timeout if none was previously set', () => {
        // arrange
        const timerStub = new TimeFunctionsStub();
        const scheduler = new TimeoutDelayScheduler(timerStub);
        // act
        scheduler.scheduleNext(() => {}, 100);
        // assert
        const clearTimeoutCalls = timerStub.callHistory.filter((c) => c.methodName === 'clearTimeout');
        expect(clearTimeoutCalls.length).toBe(0);
      });
    });
    describe('when rescheduling a timeout', () => {
      it('clears the previous timeout', () => {
        // arrange
        const timerStub = new TimeFunctionsStub();
        const scheduler = new TimeoutDelayScheduler(timerStub);
        const idOfFirstSetTimeoutCall = 1;
        // act
        scheduler.scheduleNext(() => {}, 100);
        scheduler.scheduleNext(() => {}, 200);
        // assert
        const setTimeoutCalls = timerStub.callHistory.filter((c) => c.methodName === 'setTimeout');
        expect(setTimeoutCalls.length).toBe(2);
        const clearTimeoutCalls = timerStub.callHistory.filter((c) => c.methodName === 'clearTimeout');
        expect(clearTimeoutCalls.length).toBe(1);
        const [timeout] = clearTimeoutCalls[0].args;
        const actualId = Number(timeout);
        expect(actualId).toBe(idOfFirstSetTimeoutCall);
      });
    });
  });
});

class TimeFunctionsStub
  extends StubWithObservableMethodCalls<TimeFunctions>
  implements TimeFunctions {
  public clearTimeout(id: ReturnType<typeof setTimeout>): void {
    this.registerMethodCall({
      methodName: 'clearTimeout',
      args: [id],
    });
  }

  public setTimeout(callback: () => void, delayInMs: number): ReturnType<typeof setTimeout> {
    this.registerMethodCall({
      methodName: 'setTimeout',
      args: [callback, delayInMs],
    });
    const id = this.callHistory.filter((c) => c.methodName === 'setTimeout').length;
    return createMockTimeout(id);
  }
}
