export type SchedulerType = (callback: (...args: any[]) => void, ms: number) => void;

export function sleepAsync(time: number, scheduler: SchedulerType = setTimeout) {
    return new Promise((resolve) => scheduler(() => resolve(undefined), time));
}
