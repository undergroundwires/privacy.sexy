import { it, expect } from 'vitest';
import type { SanityValidator } from '@/infrastructure/RuntimeSanity/Common/SanityValidator';

export function itNoErrorsOnCurrentEnvironment(
  factory: () => SanityValidator,
) {
  it('it does report errors on current environment', () => {
    // arrange
    const validator = factory();
    // act
    const errors = [...validator.collectErrors()];
    // assert
    expect(errors).to.have.lengthOf(0);
  });
}
