import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RatingCircle from '@/presentation/components/Scripts/Menu/Recommendation/Rating/RatingCircle.vue';
import CircleRating from '@/presentation/components/Scripts/Menu/Recommendation/Rating/CircleRating.vue';

const MAX_RATING = 4;

describe('CircleRating.vue', () => {
  describe('number of RatingCircle components', () => {
    it('renders correct number of RatingCircle components based on maxRating', () => {
      // arrange
      const expectedMaxRating = MAX_RATING;
      const currentRating = MAX_RATING - 1;

      // act
      const wrapper = shallowMount(CircleRating, {
        propsData: {
          rating: currentRating,
        },
      });

      // assert
      const ratingCircles = wrapper.findAllComponents(RatingCircle);
      expect(ratingCircles.length).to.equal(expectedMaxRating);
    });
    it('renders the correct number of RatingCircle components for default rating', () => {
      // arrange
      const expectedMaxRating = MAX_RATING;

      // act
      const wrapper = shallowMount(CircleRating);

      // assert
      const ratingCircles = wrapper.findAllComponents(RatingCircle);
      expect(ratingCircles.length).to.equal(expectedMaxRating);
    });
  });

  describe('rating logic', () => {
    it('fills the correct number of RatingCircle components based on the provided rating', () => {
      // arrange
      const expectedTotalComponents = 3;

      // act
      const wrapper = shallowMount(CircleRating, {
        propsData: {
          rating: expectedTotalComponents,
        },
      });

      // assert
      const filledCircles = wrapper.findAllComponents(RatingCircle).filter((w) => w.props().filled);
      expect(filledCircles.length).to.equal(expectedTotalComponents);
    });

    describe('validates rating correctly', () => {
      const testCases = [
        {
          value: -1,
          expectedValidationResult: false,
        },
        {
          value: 0,
          expectedValidationResult: true,
        },
        {
          value: MAX_RATING - 1,
          expectedValidationResult: true,
        },
        {
          value: MAX_RATING,
          expectedValidationResult: true,
        },
      ];
      testCases.forEach((testCase) => {
        it(`given ${testCase.value} return ${testCase.expectedValidationResult ? 'true' : 'false'}`, () => {
          // arrange
          const { validator } = CircleRating.props.rating;

          // act
          const actualValidationResult = validator(testCase.value);

          // act
          expect(actualValidationResult).to.equal(testCase.expectedValidationResult);
        });
      });
    });
  });
});
