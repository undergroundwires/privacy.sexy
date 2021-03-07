export function throttle<T extends []>(
    callback: (..._: T) => void, wait: number,
    timer: ITimer = NodeTimer): (..._: T) => void {
    let queuedToRun: ReturnType<typeof setTimeout>;
    let previouslyRun: number;
    return function invokeFn(...args: T) {
        const now = timer.dateNow();
        if (queuedToRun) {
            queuedToRun = timer.clearTimeout(queuedToRun) as undefined;
        }
        if (!previouslyRun || (now - previouslyRun >= wait)) {
            callback(...args);
            previouslyRun = now;
        } else {
            queuedToRun = timer.setTimeout(invokeFn.bind(null, ...args), wait - (now - previouslyRun));
        }
    };
}

export interface ITimer {
    setTimeout: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
    clearTimeout: (timeoutId: ReturnType<typeof setTimeout>) => void;
    dateNow(): number;
}

const NodeTimer: ITimer = {
    setTimeout: (callback, ms) => setTimeout(callback, ms),
    clearTimeout: (timeoutId) => clearTimeout(timeoutId),
    dateNow: () => Date.now(),
};
