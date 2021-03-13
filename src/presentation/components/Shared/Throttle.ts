export type CallbackType = (..._: any[]) => void;

export function throttle(
    callback: CallbackType, waitInMs: number,
    timer: ITimer = NodeTimer): CallbackType {
    const throttler = new Throttler(timer, waitInMs, callback);
    return (...args: any[]) => throttler.invoke(...args);
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

interface IThrottler {
    invoke: CallbackType;
}

class Throttler implements IThrottler {
    private queuedToRun: ReturnType<typeof setTimeout>;
    private previouslyRun: number;
    constructor(
        private readonly timer: ITimer,
        private readonly waitInMs: number,
        private readonly callback: CallbackType) {
        if (!timer) { throw new Error('undefined timer'); }
        if (!waitInMs) { throw new Error('no delay to throttle'); }
        if (waitInMs < 0) { throw new Error('negative delay'); }
        if (!callback) { throw new Error('undefined callback'); }
    }
    public invoke(...args: any[]): void {
        const now = this.timer.dateNow();
        if (this.queuedToRun) {
            this.queuedToRun = this.timer.clearTimeout(this.queuedToRun) as undefined;
        }
        if (!this.previouslyRun || (now - this.previouslyRun >= this.waitInMs)) {
            this.callback(...args);
            this.previouslyRun = now;
        } else {
            const nextCall = () => this.invoke(...args);
            const nextCallDelayInMs = this.waitInMs - (now - this.previouslyRun);
            this.queuedToRun = this.timer.setTimeout(nextCall, nextCallDelayInMs);
        }
    }
}
