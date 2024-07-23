import type { LifecycleHookCallback, LifecycleHook } from '@/presentation/components/Shared/Hooks/Common/LifecycleHook';

export class LifecycleHookStub {
  private registeredCallbacks = new Array<LifecycleHookCallback>();

  private invokeCallbackImmediately = false;

  public withInvokeCallbackImmediately(callImmediatelyOnRegistration: boolean): this {
    this.invokeCallbackImmediately = callImmediatelyOnRegistration;
    return this;
  }

  public get totalRegisteredCallbacks(): number {
    return this.registeredCallbacks.length;
  }

  public executeAllCallbacks() {
    for (const callback of this.registeredCallbacks) {
      callback();
    }
  }

  public getHook(): LifecycleHook {
    return (callback: LifecycleHookCallback) => {
      this.registeredCallbacks.push(callback);
      if (this.invokeCallbackImmediately) {
        callback();
      }
    };
  }
}
