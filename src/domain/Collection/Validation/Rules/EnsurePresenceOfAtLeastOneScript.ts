import type { CategoryCollectionValidator } from '../CategoryCollectionValidator';

export const ensurePresenceOfAtLeastOneScript: CategoryCollectionValidator = (
  context,
) => {
  if (!context.allScripts.length) {
    throw new Error('Collection must have at least one script');
  }
};
