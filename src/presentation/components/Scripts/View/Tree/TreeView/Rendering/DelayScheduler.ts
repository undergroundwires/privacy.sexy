export interface DelayScheduler {
  scheduleNext(callback: () => void, delayInMs: number): void;
}
