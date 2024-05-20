import type { CallbackType, ThrottleFunction } from '@/application/Common/Timing/Throttle';

export class ThrottleStub {
  public readonly throttleInitializationCallArgs: Array<Parameters<ThrottleFunction>> = [];

  public readonly throttledFunctionCallArgs = new Array<readonly unknown[]>();

  private executeImmediately: boolean = false;

  public func = (callback: CallbackType, waitInMs: number): ReturnType<ThrottleFunction> => {
    this.throttleInitializationCallArgs.push([callback, waitInMs]);
    return (...args: readonly unknown[]) => {
      this.throttledFunctionCallArgs.push([...args]);
      if (this.executeImmediately) {
        callback(...args);
      }
    };
  };

  public withImmediateExecution(executeImmediately: boolean): this {
    this.executeImmediately = executeImmediately;
    return this;
  }

  public executeFirst() {
    if (this.throttledFunctionCallArgs.length === 0) {
      throw new Error('Function was never throttled.');
    }
    const firstArgs = this.throttledFunctionCallArgs[0];
    this.throttleInitializationCallArgs.forEach(([callback]) => {
      callback(...firstArgs);
    });
  }
}
