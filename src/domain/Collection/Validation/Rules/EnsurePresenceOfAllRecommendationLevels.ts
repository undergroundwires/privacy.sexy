import { getEnumValues } from '@/application/Common/Enum';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import type { CategoryCollectionValidator } from '../CategoryCollectionValidator';

export const ensurePresenceOfAllRecommendationLevels: CategoryCollectionValidator = (
  context,
) => {
  const unrepresentedRecommendationLevels = getUnrepresentedRecommendationLevels(
    context.allScripts,
  );
  if (unrepresentedRecommendationLevels.length === 0) {
    return;
  }
  const formattedRecommendationLevels = unrepresentedRecommendationLevels
    .map((level) => getDisplayName(level))
    .join(', ');
  throw new Error(`Missing recommendation levels: ${formattedRecommendationLevels}.`);
};

function getUnrepresentedRecommendationLevels(
  scripts: readonly Script[],
): (RecommendationLevel | undefined)[] {
  const expectedLevels = [
    undefined,
    ...getEnumValues(RecommendationLevel),
  ];
  return expectedLevels.filter(
    (level) => scripts.every((script) => script.level !== level),
  );
}

function getDisplayName(level: RecommendationLevel | undefined): string {
  return level === undefined ? 'None' : RecommendationLevel[level];
}
