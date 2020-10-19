export enum RecommendationLevel {
    Standard = 0,
    Strict = 1,
}

export const RecommendationLevelNames = Object
    .values(RecommendationLevel)
    .filter((level) => typeof level === 'string') as string[];

export const RecommendationLevels = RecommendationLevelNames
    .map((level) => RecommendationLevel[level]) as RecommendationLevel[];
