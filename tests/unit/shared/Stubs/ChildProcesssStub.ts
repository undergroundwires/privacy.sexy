import { EventEmitter } from 'node:events';
import type { CommandProcess } from '@/infrastructure/CodeRunner/System/SystemOperations';

export class ChildProcessStub extends EventEmitter implements CommandProcess {
  private autoEmitExit = true;

  public on(event: string, listener: Parameters<EventEmitter['on']>[1]): this {
    super.on(event, listener);
    if (event === 'exit' && this.autoEmitExit) {
      this.emitExit(0, null);
    }
    return this;
  }

  public emitExit(code: number | null, signal: NodeJS.Signals | null) {
    this.emit('exit', code, signal);
  }

  public emitError(error: Error): void {
    this.emit('error', error);
  }

  public withAutoEmitExit(autoEmitExit: boolean): this {
    this.autoEmitExit = autoEmitExit;
    return this;
  }

  public asChildProcess(): CommandProcess {
    return this;
  }
}
