import { Timer, TimeoutType } from './Timer';
import { PlatformTimer } from './PlatformTimer';

export type CallbackType = (..._: unknown[]) => void;

export function throttle(
  callback: CallbackType,
  waitInMs: number,
  timer: Timer = PlatformTimer,
): CallbackType {
  const throttler = new Throttler(timer, waitInMs, callback);
  return (...args: unknown[]) => throttler.invoke(...args);
}

class Throttler {
  private queuedExecutionId: TimeoutType | undefined;

  private previouslyRun: number;

  constructor(
    private readonly timer: Timer,
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
