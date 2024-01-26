import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SelectionTypeDocumentation from '@/presentation/components/Scripts/Menu/Selector/SelectionTypeDocumentation.vue';
import CircleRating from '@/presentation/components/Scripts/Menu/Selector/Rating/CircleRating.vue';

const DOM_SELECTOR_INCLUDES_SECTION = '.includes';
const DOM_SELECTOR_CONSIDERATIONS_SECTION = '.considerations';

describe('SelectionTypeDocumentation.vue', () => {
  it('renders privacy rating using CircleRating component', () => {
    // arrange
    const expectedPrivacyRating = 3;

    // act
    const wrapper = mountComponent({
      privacyRating: expectedPrivacyRating,
    });

    // assert
    const ratingComponent = wrapper.findComponent(CircleRating);
    expect(ratingComponent.exists()).to.equal(true);
    expect(ratingComponent.props().rating).to.equal(expectedPrivacyRating);
  });

  it('renders the provided description', () => {
    // arrange
    const expectedDescription = 'Some description';

    // act
    const wrapper = mountComponent({
      description: expectedDescription,
    });

    // assert
    expect(wrapper.text()).to.include(expectedDescription);
  });

  it('renders the provided recommendation', () => {
    // arrange
    const expectedRecommendation = 'Some recommendation';

    // act
    const wrapper = mountComponent({
      recommendation: expectedRecommendation,
    });

    // assert
    expect(wrapper.text()).to.include(expectedRecommendation);
  });

  describe('includes', () => {
    it('renders items if provided', () => {
      // arrange
      const expectedIncludes = ['Item 1', 'Item 2'];

      // act
      const wrapper = mountComponent({
        includes: expectedIncludes,
      });

      // assert
      expect(wrapper.text()).to.include(expectedIncludes[0]);
      expect(wrapper.text()).to.include(expectedIncludes[1]);
    });

    it('renders included section if provided', () => {
      // arrange
      // act
      const wrapper = mountComponent({
        includes: ['some', 'includes'],
      });

      // assert
      const includesSection = wrapper.find(DOM_SELECTOR_INCLUDES_SECTION);
      expect(includesSection.exists()).to.equal(true);
    });

    it('does not render included section if no items provided', () => {
      // arrange
      // act
      const wrapper = mountComponent({
        includes: [],
      });

      // assert
      const includesSection = wrapper.find(DOM_SELECTOR_INCLUDES_SECTION);
      expect(includesSection.exists()).to.equal(false);
    });
  });

  describe('considerations', () => {
    it('renders if provided', () => {
      // arrange
      const expectedConsiderations = ['Consideration 1', 'Consideration 2'];

      // act
      const wrapper = mountComponent({
        considerations: expectedConsiderations,
      });

      // assert
      expect(wrapper.text()).to.include(expectedConsiderations[0]);
      expect(wrapper.text()).to.include(expectedConsiderations[1]);
    });

    it('renders included section if provided', () => {
      // arrange
      // act
      const wrapper = mountComponent({
        considerations: ['some', 'considerations'],
      });

      // assert
      const considerationsSection = wrapper.find(DOM_SELECTOR_CONSIDERATIONS_SECTION);
      expect(considerationsSection.exists()).to.equal(true);
    });

    it('does not render considerations section if no items provided', () => {
      // arrange
      // act
      const wrapper = mountComponent({
        considerations: [],
      });

      // assert
      const considerationsSection = wrapper.find(DOM_SELECTOR_CONSIDERATIONS_SECTION);
      expect(considerationsSection.exists()).to.equal(false);
    });
  });
});

function mountComponent(options: {
  readonly privacyRating?: number,
  readonly description?: string,
  readonly recommendation?: string,
  readonly includes?: string[],
  readonly considerations?: string[],
}) {
  return shallowMount(SelectionTypeDocumentation, {
    propsData: {
      privacyRating: options.privacyRating ?? 0,
      description: options.description ?? 'test-description',
      recommendation: options.recommendation ?? 'test-recommendation',
      considerations: options.considerations ?? [],
      includes: options.includes ?? [],
    },
  });
}
