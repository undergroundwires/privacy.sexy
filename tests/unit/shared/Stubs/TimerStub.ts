import type { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { EventSource } from '@/infrastructure/Events/EventSource';
import type { TimeoutType, Timer } from '@/application/Common/Timing/Timer';
import { createMockTimeout } from './TimeoutStub';

export class TimerStub implements Timer {
  private timeChanged = new EventSource<number>();

  private subscriptions = new Array<IEventSubscription>();

  private currentTime = 0;

  public setTimeout(callback: () => void, ms: number): TimeoutType {
    const runTime = this.currentTime + ms;
    const subscription = this.timeChanged.on((time) => {
      if (time >= runTime) {
        callback();
        subscription.unsubscribe();
      }
    });
    this.subscriptions.push(subscription);
    const id = this.subscriptions.length - 1;
    return createMockTimeout(id);
  }

  public clearTimeout(timeoutId: TimeoutType): void {
    this.subscriptions[+timeoutId].unsubscribe();
  }

  public dateNow(): number {
    return this.currentTime;
  }

  public tickNext(ms: number): void {
    this.setCurrentTime(this.currentTime + ms);
  }

  public setCurrentTime(ms: number): void {
    this.currentTime = ms;
    this.timeChanged.notify(this.currentTime);
  }
}
