/* eslint-disable max-classes-per-file */
import { PlatformTimer } from './PlatformTimer';
import type { Timer, TimeoutType } from './Timer';

export type CallbackType = (..._: readonly unknown[]) => void;

export interface ThrottleOptions {
  /** Skip the immediate execution of the callback on the first invoke */
  readonly excludeLeadingCall: boolean;
  readonly timer: Timer;
}

const DefaultOptions: ThrottleOptions = {
  excludeLeadingCall: false,
  timer: PlatformTimer,
};

export function throttle(
  callback: CallbackType,
  waitInMs: number,
  options: Partial<ThrottleOptions> = DefaultOptions,
): CallbackType {
  const defaultedOptions: ThrottleOptions = {
    ...DefaultOptions,
    ...options,
  };
  const throttler = new Throttler(waitInMs, callback, defaultedOptions);
  return (...args: unknown[]) => throttler.invoke(...args);
}

class Throttler {
  private lastExecutionTime: number | null = null;

  private executionScheduler: DelayedCallbackScheduler;

  constructor(
    private readonly waitInMs: number,
    private readonly callback: CallbackType,
    private readonly options: ThrottleOptions,
  ) {
    if (!waitInMs) { throw new Error('missing delay'); }
    if (waitInMs < 0) { throw new Error('negative delay'); }
    this.executionScheduler = new DelayedCallbackScheduler(options.timer);
  }

  public invoke(...args: unknown[]): void {
    switch (true) {
      case this.isLeadingCallWithinThrottlePeriod(): {
        if (this.options.excludeLeadingCall) {
          this.scheduleNext(args);
          return;
        }
        this.executeNow(args);
        return;
      }
      case this.isAlreadyScheduled(): {
        this.updateNextScheduled(args);
        return;
      }
      case !this.isThrottlePeriodPassed(): {
        this.scheduleNext(args);
        return;
      }
      default:
        throw new Error('Throttle logical error: no conditions for execution or scheduling were met.');
    }
  }

  private isLeadingCallWithinThrottlePeriod(): boolean {
    return this.isThrottlePeriodPassed()
      && !this.isAlreadyScheduled();
  }

  private isThrottlePeriodPassed(): boolean {
    if (this.lastExecutionTime === null) {
      return true;
    }
    const timeSinceLastExecution = this.options.timer.dateNow() - this.lastExecutionTime;
    const isThrottleTimePassed = timeSinceLastExecution >= this.waitInMs;
    return isThrottleTimePassed;
  }

  private isAlreadyScheduled(): boolean {
    return this.executionScheduler.getNext() !== null;
  }

  private scheduleNext(args: unknown[]): void {
    if (this.executionScheduler.getNext()) {
      throw new Error('An execution is already scheduled.');
    }
    this.executionScheduler.resetNext(
      () => this.executeNow(args),
      this.waitInMs,
    );
  }

  private updateNextScheduled(args: unknown[]): void {
    const nextScheduled = this.executionScheduler.getNext();
    if (!nextScheduled) {
      throw new Error('A non-existent scheduled execution cannot be updated.');
    }
    const nextDelay = nextScheduled.scheduledTime - this.dateNow();
    this.executionScheduler.resetNext(
      () => this.executeNow(args),
      nextDelay,
    );
  }

  private executeNow(args: unknown[]): void {
    this.callback(...args);
    this.lastExecutionTime = this.dateNow();
  }

  private dateNow(): number {
    return this.options.timer.dateNow();
  }
}

interface ScheduledCallback {
  readonly scheduleTimeoutId: TimeoutType;
  readonly scheduledTime: number;
}

class DelayedCallbackScheduler {
  private scheduledCallback: ScheduledCallback | null = null;

  constructor(
    private readonly timer: Timer,
  ) { }

  public getNext(): ScheduledCallback | null {
    return this.scheduledCallback;
  }

  public resetNext(
    callback: () => void,
    delayInMs: number,
  ) {
    this.clear();
    this.scheduledCallback = {
      scheduledTime: this.timer.dateNow() + delayInMs,
      scheduleTimeoutId: this.timer.setTimeout(() => {
        this.clear();
        callback();
      }, delayInMs),
    };
  }

  private clear() {
    if (this.scheduledCallback === null) {
      return;
    }
    this.timer.clearTimeout(this.scheduledCallback.scheduleTimeoutId);
    this.scheduledCallback = null;
  }
}
