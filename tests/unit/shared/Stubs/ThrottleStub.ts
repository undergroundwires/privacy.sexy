import type { CallbackType, ThrottleFunction } from '@/application/Common/Timing/Throttle';

export class ThrottleStub {
  public readonly throttleInitializationCallArgs = new Array<ThrottleInitialization>();

  public readonly throttledFunctionCallArgs = new Array<readonly unknown[]>();

  private readonly firstCallbacks = new Array<() => void>();

  private executeImmediately: boolean = false;

  public readonly func: ThrottleFunction = <TArgs extends readonly unknown[]>(
    callback: CallbackType<TArgs>,
    waitInMs: number,
  ): CallbackType<TArgs> => {
    this.throttleInitializationCallArgs.push({ waitInMs });
    let executeFirst: (() => void) | undefined;
    return (...args: TArgs) => {
      this.throttledFunctionCallArgs.push([...args]);
      if (executeFirst === undefined) {
        executeFirst = () => callback(...args);
        this.firstCallbacks.push(executeFirst);
      }
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
    if (this.firstCallbacks.length === 0) {
      throw new Error('Function was never throttled.');
    }
    this.firstCallbacks.forEach((callback) => callback());
  }
}

interface ThrottleInitialization {
  readonly waitInMs: number;
}
