import 'mocha';
import { expect } from 'chai';
import { throttle, ITimer } from '@/presentation/components/Shared/Throttle';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

describe('throttle', () => {
    it('should call the callback immediately', () => {
        // arrange
        const timer = new TimerMock();
        let totalRuns = 0;
        const callback = () => totalRuns++;
        const throttleFunc = throttle(callback, 500, timer);
        // act
        throttleFunc();
        // assert
        expect(totalRuns).to.equal(1);
    });
    it('should call the callback again after the timeout', () => {
        // arrange
        const timer = new TimerMock();
        let totalRuns = 0;
        const callback = () => totalRuns++;
        const throttleFunc = throttle(callback, 500, timer);
        // act
        throttleFunc();
        totalRuns--;
        throttleFunc();
        timer.tick(500);
        // assert
        expect(totalRuns).to.equal(1);
    });
    it('calls the callback at most once at given time', () => {
        // arrange
        const timer = new TimerMock();
        let totalRuns = 0;
        const callback = () => totalRuns++;
        const waitInMs = 500;
        const totalCalls = 10;
        const throttleFunc = throttle(callback, waitInMs, timer);
        // act
        for (let i = 0; i < totalCalls; i++) {
            timer.tick(waitInMs / totalCalls * i);
            throttleFunc();
        }
        // assert
        expect(totalRuns).to.equal(2); // initial and at the end
    });
});

class TimerMock implements ITimer {
    private timeChanged = new EventSource<number>();
    private subscriptions = new Array<IEventSubscription>();
    private currentTime = 0;
    public setTimeout(callback: () => void, ms: number): NodeJS.Timeout {
        const runTime = this.currentTime + ms;
        const subscription = this.timeChanged.on((time) => {
            if (time >= runTime) {
                callback();
                subscription.unsubscribe();
            }
        });
        this.subscriptions.push(subscription);
        return (this.subscriptions.length - 1) as any;
    }
    public clearTimeout(timeoutId: NodeJS.Timeout): void {
        this.subscriptions[timeoutId as any].unsubscribe();
    }
    public dateNow(): number {
        return this.currentTime;
    }
    public tick(ms: number): void {
        this.currentTime = ms;
        this.timeChanged.notify(this.currentTime);
    }
}
