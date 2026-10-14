export class BatchedDebounceStub<T> {
  public readonly callHistory = new Array<BatchedDebounceInitialization<T>>();

  public readonly collectedArgs = new Array<T>();

  private executeImmediately = false;

  public func = (
    callback: (batches: readonly T[]) => void,
    waitInMs: number,
  ): (arg: T) => void => {
    this.callHistory.push([callback, waitInMs]);
    return (arg: T) => {
      this.collectedArgs.push(arg);
      if (this.executeImmediately) {
        callback([arg]);
      }
    };
  };

  public withImmediateDebouncing(executeImmediately: boolean): this {
    this.executeImmediately = executeImmediately;
    return this;
  }

  public execute() {
    this.callHistory
      .map((call) => call[0])
      .forEach((callback) => callback(this.collectedArgs));
  }
}

type BatchedDebounceInitialization<T> = readonly [
  callback: (batches: readonly T[]) => void,
  waitInMs: number,
];
