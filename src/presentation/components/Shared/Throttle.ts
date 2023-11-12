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
export type Timeout = ReturnType<typeof setTimeout>;

export interface ITimer {
  setTimeout: (callback: () => void, ms: number) => Timeout;
  clearTimeout: (timeoutId: Timeout) => void;
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
  private queuedExecutionId: Timeout | undefined;

  private previouslyRun: number;

  constructor(
    private readonly timer: ITimer,
    private readonly waitInMs: number,
    private readonly callback: CallbackType,
  ) {
    if (!waitInMs) { throw new Error('missing delay'); }
    if (waitInMs < 0) { throw new Error('negative delay'); }
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
