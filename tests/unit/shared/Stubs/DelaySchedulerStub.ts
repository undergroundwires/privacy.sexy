import type { DelayScheduler } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/DelayScheduler';

export class DelaySchedulerStub implements DelayScheduler {
  public nextCallback: (() => void) | undefined = undefined;

  public scheduleNext(callback: () => void): void {
    this.nextCallback = callback;
  }

  public runNextScheduled(): void {
    if (!this.nextCallback) {
      throw new Error('no callback is scheduled');
    }
    // Store the callback to prevent changes to this.nextCallback during execution
    const callback = this.nextCallback;
    this.nextCallback = undefined;
    callback();
  }
}
