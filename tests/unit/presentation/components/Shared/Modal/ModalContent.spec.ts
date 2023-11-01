import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ModalContent from '@/presentation/components/Shared/Modal/ModalContent.vue';

const DOM_MODAL_CONTENT_SELECTOR = '.modal-content-content';
const DOM_MODAL_CONTENT_WRAPPER_SELECTOR = '.modal-content-wrapper';

describe('ModalContent.vue', () => {
  describe('rendering based on `show` prop', () => {
    it('renders modal content when `show` prop is true', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true });

      // act
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);

      // assert
      expect(modalContentWrapper.exists()).to.equal(true);
    });

    it('does not render modal content when `show` prop is false', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: false });

      // act
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);

      // assert
      expect(modalContentWrapper.exists()).to.equal(false);
    });

    it('does not render modal content by default', () => {
      // arrange & act
      const wrapper = mountComponent();

      // assert
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);
      expect(modalContentWrapper.exists()).to.equal(false);
    });
  });

  it('renders slot content when provided', () => {
    // arrange
    const expectedText = 'Slot content';
    const slotContentClass = 'slot-content';

    // act
    const wrapper = mountComponent({
      showProperty: true,
      slotHtml: `<div class="${slotContentClass}">${expectedText}</div>`,
    });

    // assert
    const slotWrapper = wrapper.find(`.${slotContentClass}`);
    const slotText = slotWrapper.text();
    expect(slotText).to.equal(expectedText);
  });

  describe('aria attributes', () => {
    it('sets aria-expanded to `true` when visible', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('aria-expanded')).to.equal('true');
    });

    it('always sets aria-modal to true for the modal content', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('aria-modal')).to.equal('true');
    });
  });

  it('emits `transitionedOut` event after the transition leave', async () => {
    // arrange
    const wrapper = mountComponent({ showProperty: true });

    // act
    await wrapper.vm.$nextTick(); // Ensure the component reflects initial prop
    wrapper.setProps({ show: false }); // Trigger the transition
    await wrapper.vm.$nextTick(); // Allow the component to update
    const transitionWrapper = wrapper.findComponent({ name: 'transition' });
    transitionWrapper.vm.$emit('after-leave'); // Simulate the after-leave lifecycle hook of the transition

    // assert
    expect(wrapper.emitted().transitionedOut).to.have.length(1);
  });
});

function mountComponent(options?: {
  readonly showProperty?: boolean,
  readonly slotHtml?: string,
}) {
  return shallowMount(ModalContent, {
    props: options?.showProperty !== undefined ? { show: options?.showProperty } : undefined,
    slots: options?.slotHtml !== undefined ? { default: options?.slotHtml } : undefined,
  });
}
