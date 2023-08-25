import { ISanityCheckOptions } from './ISanityCheckOptions';
import { ISanityValidator } from './ISanityValidator';

export type FactoryFunction<T> = () => T;

export abstract class FactoryValidator<T> implements ISanityValidator {
  private readonly factory: FactoryFunction<T>;

  protected constructor(factory: FactoryFunction<T>) {
    if (!factory) {
      throw new Error('missing factory');
    }
    this.factory = factory;
  }

  public abstract shouldValidate(options: ISanityCheckOptions): boolean;

  public abstract name: string;

  public* collectErrors(): Iterable<string> {
    try {
      const value = this.factory();
      if (!value) {
        // Do not remove this check, it ensures that the factory call is not optimized away.
        yield 'Factory resulted in a falsy value';
      }
    } catch (error) {
      yield `Error in factory creation: ${error.message}`;
    }
  }
}
