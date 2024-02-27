import { it, expect } from 'vitest';
import type { Constructible } from '@/TypeHelpers';

interface ISingletonTestData<T> {
  readonly getter: () => T;
  readonly expectedType?: Constructible<T>;
}

export function itIsSingleton<T>(test: ISingletonTestData<T>): void {
  if (test.expectedType !== undefined) {
    it('gets the expected type', () => {
      // act
      const instance = test.getter();
      // assert
      expect(instance).to.be.instanceOf(test.expectedType);
    });
  }
  it('multiple calls get the same instance', () => {
    // act
    const instance1 = test.getter();
    const instance2 = test.getter();
    // assert
    expect(instance1).to.equal(instance2);
  });
}
