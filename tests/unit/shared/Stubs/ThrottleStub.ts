import type { CallbackType, ThrottleFunction, ThrottleOptions } from '@/application/Common/Timing/Throttle';

export class ThrottleStub {
  public readonly throttleInitializationCallArgs: Array<Parameters<ThrottleFunction>> = [];

  public readonly throttledFunctionCallArgs = new Array<readonly unknown[]>();

  private executeImmediately: boolean = false;

  public get func(): ThrottleFunction {
    return <TCallbackArgs extends unknown[]>(
      callback: CallbackType<TCallbackArgs>,
      waitInMs: number,
      options?: Partial<ThrottleOptions>,
    ): CallbackType<TCallbackArgs> => {
      this.throttleInitializationCallArgs.push([
        callback as CallbackType<unknown[]>,
        waitInMs,
        options,
      ]);
      const throttledFn = (...callbackArgs: TCallbackArgs): void => {
        this.throttledFunctionCallArgs.push([...callbackArgs]);
        if (this.executeImmediately) {
          callback(...callbackArgs);
        }
      };
      return throttledFn;
    };
  }

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
