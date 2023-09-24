import { DelayScheduler } from './DelayScheduler';

export class TimeoutDelayScheduler implements DelayScheduler {
  private timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  constructor(private readonly timer: TimeFunctions = {
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setTimeout: globalThis.setTimeout.bind(globalThis),
  }) { }

  public scheduleNext(callback: () => void, delayInMs: number): void {
    this.clear();
    this.timeoutId = this.timer.setTimeout(callback, delayInMs);
  }

  private clear(): void {
    if (this.timeoutId === undefined) {
      return;
    }
    this.timer.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }
}

export interface TimeFunctions {
  clearTimeout(id: ReturnType<typeof setTimeout>): void;
  setTimeout(callback: () => void, delayInMs: number): ReturnType<typeof setTimeout>;
}
