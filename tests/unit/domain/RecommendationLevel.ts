import 'mocha';
import { expect } from 'chai';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';

describe('RecommendationLevel', () => {
    describe('RecommendationLevelNames', () => {
        // arrange
        const expected = [
            RecommendationLevel[RecommendationLevel.Strict],
            RecommendationLevel[RecommendationLevel.Standard],
        ];
        // act
        const actual = RecommendationLevelNames;
        // assert
        expect(actual).to.have.deep.members(expected);
    });
});
