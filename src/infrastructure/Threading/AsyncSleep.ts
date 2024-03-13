export type SchedulerCallbackType = (...args: unknown[]) => void;
export type SchedulerType = (callback: SchedulerCallbackType, ms: number) => void;

export function sleep(
  time: number,
  scheduler: SchedulerType = setTimeout,
): Promise<void> {
  return new Promise((resolve) => {
    scheduler(() => resolve(undefined), time);
  });
}
