export type CallbackType = (..._: unknown[]) => void;

export function throttle(
  callback: CallbackType,
  waitInMs: number,
  timer: ITimer = NodeTimer,
): CallbackType {
  const throttler = new Throttler(timer, waitInMs, callback);
  return (...args: unknown[]) => throttler.invoke(...args);
}

// Allows aligning with both NodeJs (NodeJs.Timeout) and Window type (number)
export type TimeoutType = ReturnType<typeof setTimeout>;

export interface ITimer {
  setTimeout: (callback: () => void, ms: number) => TimeoutType;
  clearTimeout: (timeoutId: TimeoutType) => void;
  dateNow(): number;
}

const NodeTimer: ITimer = {
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (timeoutId) => clearTimeout(timeoutId),
  dateNow: () => Date.now(),
};

interface IThrottler {
  invoke: CallbackType;
}

class Throttler implements IThrottler {
  private queuedExecutionId: TimeoutType;

  private previouslyRun: number;

  constructor(
    private readonly timer: ITimer,
    private readonly waitInMs: number,
    private readonly callback: CallbackType,
  ) {
    if (!timer) { throw new Error('missing timer'); }
    if (!waitInMs) { throw new Error('missing delay'); }
    if (waitInMs < 0) { throw new Error('negative delay'); }
    if (!callback) { throw new Error('missing callback'); }
  }

  public invoke(...args: unknown[]): void {
    const now = this.timer.dateNow();
    if (this.queuedExecutionId !== undefined) {
      this.timer.clearTimeout(this.queuedExecutionId);
      this.queuedExecutionId = undefined;
    }
    if (!this.previouslyRun || (now - this.previouslyRun >= this.waitInMs)) {
      this.callback(...args);
      this.previouslyRun = now;
    } else {
      const nextCall = () => this.invoke(...args);
      const nextCallDelayInMs = this.waitInMs - (now - this.previouslyRun);
      this.queuedExecutionId = this.timer.setTimeout(nextCall, nextCallDelayInMs);
    }
  }
}
