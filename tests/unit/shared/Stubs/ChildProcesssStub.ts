import { type ChildProcess } from 'node:child_process';

type EventListenerCallback = (...args: unknown[]) => void;

export class ChildProcessStub implements Partial<ChildProcess> {
  private readonly eventListeners: Record<string, EventListenerCallback[]> = {};

  private autoEmitExit = true;

  public on(
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void,
  ): ChildProcess {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
    if (event === 'exit' && this.autoEmitExit) {
      this.emitExit(0, null);
    }
    return this.asChildProcess();
  }

  public emitExit(code: number | null, signal: NodeJS.Signals | null) {
    this.emitEvent('exit', code, signal);
  }

  public emitError(error: Error): void {
    this.emitEvent('error', error);
  }

  public withAutoEmitExit(autoEmitExit: boolean): this {
    this.autoEmitExit = autoEmitExit;
    return this;
  }

  public asChildProcess(): ChildProcess {
    return this as unknown as ChildProcess;
  }

  private emitEvent(event: string, ...args: unknown[]): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => {
        listener(...args);
      });
    }
  }
}
