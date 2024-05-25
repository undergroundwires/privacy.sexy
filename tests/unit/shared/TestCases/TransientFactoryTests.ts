import type { Constructible } from '@/TypeHelpers';

interface TransientFactoryTestData<T> {
  readonly getter: () => T;
  readonly expectedType?: Constructible<T>;
}

export function itIsTransientFactory<T>(test: TransientFactoryTestData<T>): void {
  if (test.expectedType !== undefined) {
    it('gets the expected type', () => {
      // act
      const instance = test.getter();
      // assert
      expect(instance).to.be.instanceOf(test.expectedType);
    });
  }
  it('multiple calls get different instances', () => {
    // act
    const instance1 = test.getter();
    const instance2 = test.getter();
    // assert
    expect(instance1).to.not.equal(instance2);
  });
}
