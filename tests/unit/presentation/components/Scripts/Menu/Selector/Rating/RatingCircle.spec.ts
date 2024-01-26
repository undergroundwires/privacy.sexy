import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RatingCircle from '@/presentation/components/Scripts/Menu/Selector/Rating/RatingCircle.vue';

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
    it('sets --circle-stroke-width style correctly', () => {
      const wrapper = shallowMount(RatingCircle);
      const svgElement = wrapper.find(DOM_SVG_SELECTOR).element;
      expect(svgElement.style.getPropertyValue('--circle-stroke-width')).to.equal('2px');
    });

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
      const circle = wrapper.find(DOM_SVG_SELECTOR);

      expect(circle.attributes('viewBox')).to.equal('-1 -1 22 22');
    });
  });

  describe('circle attributes', () => {
    it('renders circle with the correct cx attribute', () => {
      const wrapper = shallowMount(RatingCircle);
      const circleElement = wrapper.find(DOM_CIRCLE_SELECTOR);

      expect(circleElement.attributes('cx')).to.equal('10'); // Based on circleDiameterInPx = 20
    });

    it('renders circle with the correct cy attribute', () => {
      const wrapper = shallowMount(RatingCircle);
      const circleElement = wrapper.find(DOM_CIRCLE_SELECTOR);

      expect(circleElement.attributes('cy')).to.equal('10'); // Based on circleDiameterInPx = 20
    });

    it('renders circle with the correct r attribute', () => {
      const wrapper = shallowMount(RatingCircle);
      const circleElement = wrapper.find(DOM_CIRCLE_SELECTOR);

      expect(circleElement.attributes('r')).to.equal('9'); // Based on circleRadiusWithoutStrokeInPx = circleDiameterInPx / 2 - circleStrokeWidthInPx / 2
    });
  });
});
