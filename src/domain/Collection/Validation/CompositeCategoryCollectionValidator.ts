import { ensurePresenceOfAtLeastOneScript } from './Rules/EnsurePresenceOfAtLeastOneScript';
import { ensurePresenceOfAtLeastOneCategory } from './Rules/EnsurePresenceOfAtLeastOneCategory';
import { ensureUniqueIdsAcrossExecutables } from './Rules/EnsureUniqueIdsAcrossExecutables';
import { ensureKnownOperatingSystem } from './Rules/EnsureKnownOperatingSystem';
import type { CategoryCollectionValidationContext, CategoryCollectionValidator } from './CategoryCollectionValidator';

export type CompositeCategoryCollectionValidator = CategoryCollectionValidator & {
  (
    ...args: [
      ...Parameters<CategoryCollectionValidator>,
      (readonly CategoryCollectionValidator[])?,
    ]
  ): ReturnType<CategoryCollectionValidator>;
};

export const validateCategoryCollection: CompositeCategoryCollectionValidator = (
  context: CategoryCollectionValidationContext,
  validators: readonly CategoryCollectionValidator[] = DefaultValidators,
) => {
  if (!validators.length) {
    throw new Error('No validators provided.');
  }
  for (const validate of validators) {
    validate(context);
  }
};

const DefaultValidators: readonly CategoryCollectionValidator[] = [
  ensureKnownOperatingSystem,
  ensurePresenceOfAtLeastOneScript,
  ensurePresenceOfAtLeastOneCategory,
  ensureUniqueIdsAcrossExecutables,
];
