import type { CategoryCollectionValidator } from '../CategoryCollectionValidator';

export const ensurePresenceOfAtLeastOneCategory: CategoryCollectionValidator = (
  context,
) => {
  if (!context.allCategories.length) {
    throw new Error('Collection must have at least one category');
  }
};
