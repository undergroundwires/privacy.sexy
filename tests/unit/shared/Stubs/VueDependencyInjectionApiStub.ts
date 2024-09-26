import type { VueDependencyInjectionApi } from '@/presentation/bootstrapping/DependencyProvider';
import type { InjectionKey } from 'vue';

export class VueDependencyInjectionApiStub implements VueDependencyInjectionApi {
  private readonly injections = new Map<unknown, unknown>();

  public provide<T>(key: InjectionKey<T>, value: T): void {
    this.injections.set(key, value);
  }

  public inject<T>(key: InjectionKey<T>): T {
    const providedValue = this.injections.get(key);
    if (providedValue === undefined) {
      throw new Error(`[${VueDependencyInjectionApiStub.name}] No value provided for key: ${String(key)}`);
    }
    return providedValue as T;
  }
}
