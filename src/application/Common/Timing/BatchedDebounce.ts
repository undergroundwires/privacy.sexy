import { PlatformTimer } from './PlatformTimer';
import { TimeoutType, Timer } from './Timer';

export function batchedDebounce<T>(
  callback: (batches: readonly T[]) => void,
  waitInMs: number,
  timer: Timer = PlatformTimer,
): (arg: T) => void {
  let lastTimeoutId: TimeoutType | undefined;
  let batches: Array<T> = [];

  return (arg: T) => {
    batches.push(arg);

    const later = () => {
      callback(batches);
      batches = [];
      lastTimeoutId = undefined;
    };

    if (lastTimeoutId !== undefined) {
      timer.clearTimeout(lastTimeoutId);
    }

    lastTimeoutId = timer.setTimeout(later, waitInMs);
  };
}
