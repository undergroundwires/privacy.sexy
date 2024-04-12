import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RatingCircle from '@/presentation/components/Scripts/Menu/Recommendation/Rating/RatingCircle.vue';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

const DOM_SVG_SELECTOR = 'svg';
const DOM_CIRCLE_SELECTOR = `${DOM_SVG_SELECTOR} > circle`;
const DOM_CIRCLE_FILLED_SELECTOR = `${DOM_CIRCLE_SELECTOR}.filled`;

describe('RatingCircle.vue', () => {
  describe('circle appearance', () => {
    it('renders a circle with the correct styles when filled', () => {
      const wrapper = shallowMount(RatingCircle, {
        propsData: {
          filled: true,
        },
      });

      const circle = wrapper.find(DOM_CIRCLE_FILLED_SELECTOR);
      expect(circle.exists()).to.equal(true);
    });

    it('renders a circle without filled styles when not filled', () => {
      const wrapper = shallowMount(RatingCircle, {
        propsData: {
          filled: false,
        },
      });

      const circle = wrapper.find(DOM_CIRCLE_FILLED_SELECTOR);
      expect(circle.exists()).to.equal(false);
    });

    it('renders without filled styles when filled prop is not provided', () => {
      const wrapper = shallowMount(RatingCircle);

      const circle = wrapper.find(DOM_CIRCLE_FILLED_SELECTOR);
      expect(circle.exists()).to.equal(false);
    });
  });

  describe('SVG and circle styles', () => {
    it('renders circle with correct fill attribute when filled prop is true', () => {
      const wrapper = shallowMount(RatingCircle, {
        propsData: {
          filled: true,
        },
      });
      const circleElement = wrapper.find(DOM_CIRCLE_FILLED_SELECTOR);

      expect(circleElement.classes()).to.include('filled');
    });

    it('renders circle with the correct viewBox property', () => {
      const wrapper = shallowMount(RatingCircle);
      const circleElement = wrapper.find(DOM_SVG_SELECTOR);

      expect(circleElement.attributes('viewBox')).to.equal('-1 -1 22 22');
    });
  });

  describe('circle attributes', () => {
    const testScenarios: ReadonlyArray<{
      readonly attributeKey: string;
      readonly expectedValue: string;
    }> = [
      {
        attributeKey: 'stroke-width',
        expectedValue: '2px', // Based on circleStrokeWidthInPx = 2
      },
      {
        attributeKey: 'cx',
        expectedValue: '10', // Based on circleDiameterInPx = 20
      },
      {
        attributeKey: 'cy',
        expectedValue: '10', // Based on circleStrokeWidthInPx = 2
      },
      {
        attributeKey: 'r',
        expectedValue: '9', // Based on circleRadiusWithoutStrokeInPx = circleDiameterInPx / 2 - circleStrokeWidthInPx / 2
      },
    ];
    testScenarios.forEach(({
      attributeKey, expectedValue,
    }) => {
      it(`renders circle with the correct ${attributeKey} attribute`, () => {
        // act
        const wrapper = shallowMount(RatingCircle);
        const circleElement = wrapper.find(DOM_CIRCLE_SELECTOR);
        const actualValue = circleElement.attributes(attributeKey);
        // assert
        expect(actualValue).to.equal(expectedValue, formatAssertionMessage([
          `Expected value: ${expectedValue}`,
          `Actual value: ${actualValue}`,
          `Attribute: ${attributeKey}`,
        ]));
      });
    });
  });
});
