import { describe, it, expect } from 'vitest';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';
import type { Category } from '@/domain/Executables/Category/Category';
import { ensurePresenceOfAtLeastOneCategory } from '@/domain/Collection/Validation/Rules/EnsurePresenceOfAtLeastOneCategory';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';

describe('ensurePresenceOfAtLeastOneCategory', () => {
  it('throws an error when no categories are present', () => {
    // arrange
    const expectedErrorMessage = 'Collection must have at least one category';
    const categories: Category[] = [];

    // act
    const act = () => test(categories);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('does not throw an error when at least one category is present', () => {
    // arrange
    const categories: Category[] = [
      new CategoryStub('existing-category'),
    ];

    // act
    const act = () => test(categories);

    // assert
    expect(act).not.to.throw();
  });
});

function test(allCategories: readonly Category[]):
ReturnType<typeof ensurePresenceOfAtLeastOneCategory> {
  const context = new CategoryCollectionValidationContextStub()
    .withAllCategories(allCategories);
  return ensurePresenceOfAtLeastOneCategory(context);
}
