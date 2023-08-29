import { it, expect } from 'vitest';
import { ISanityValidator } from '@/infrastructure/RuntimeSanity/Common/ISanityValidator';

export function itNoErrorsOnCurrentEnvironment(
  factory: () => ISanityValidator,
) {
  if (!factory) {
    throw new Error('missing factory');
  }
  it('it does report errors on current environment', () => {
    // arrange
    const validator = factory();
    // act
    const errors = [...validator.collectErrors()];
    // assert
    expect(errors).to.have.lengthOf(0);
  });
}
