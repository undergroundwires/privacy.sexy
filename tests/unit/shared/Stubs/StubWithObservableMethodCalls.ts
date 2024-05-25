import { EventSource } from '@/infrastructure/Events/EventSource';
import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { FunctionKeys } from '@/TypeHelpers';

export abstract class StubWithObservableMethodCalls<T> {
  public readonly callHistory = new Array<MethodCall<T>>();

  private readonly notifiableMethodCalls = new EventSource<MethodCall<T>>();

  public get methodCalls(): IEventSource<MethodCall<T>> {
    return this.notifiableMethodCalls;
  }

  protected registerMethodCall(name: MethodCall<T>) {
    this.callHistory.push(name);
    this.notifiableMethodCalls.notify(name);
  }
}

export type MethodCall<T> = {
  [K in FunctionKeys<T>]: {
    readonly methodName: K;
    readonly args: T[K] extends (...args: infer A) => unknown ? A : never;
  }
}[FunctionKeys<T>];
