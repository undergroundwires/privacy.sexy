import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ModalOverlay from '@/presentation/components/Shared/Modal/ModalOverlay.vue';

const DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR = '.modal-overlay-background';

describe('ModalOverlay.vue', () => {
  describe('show', () => {
    it('renders when prop is true', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true });

      // act
      const modalOverlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);

      // assert
      expect(modalOverlayBackground.exists()).to.equal(true);
    });

    it('does not render prop is false', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: false });

      // act
      const modalOverlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);

      // assert
      expect(modalOverlayBackground.exists()).to.equal(false);
    });

    it('sets aria-expanded to `true` prop is true', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalOverlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);
      expect(modalOverlayBackground.attributes('aria-expanded')).to.equal('true');
    });

    describe('on modification', () => {
      it('does not render when initially visible then turned invisible', async () => {
        // arrange
        const wrapper = mountComponent({ showProperty: true });
        await wrapper.vm.$nextTick();

        // act
        wrapper.setProps({ show: false });
        await wrapper.vm.$nextTick();

        // assert
        const modalOverlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);
        expect(modalOverlayBackground.exists()).to.equal(false);
      });

      it('renders when initially invisible then turned visible', async () => {
        // arrange
        const wrapper = mountComponent({ showProperty: false });
        await wrapper.vm.$nextTick();

        // act
        wrapper.setProps({ show: true });
        await wrapper.vm.$nextTick();

        // assert
        const modalOverlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);
        expect(modalOverlayBackground.exists()).to.equal(true);
      });
    });
  });

  describe('event emission', () => {
    it('emits `click` event when clicked', async () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true });

      // act
      const overlayBackground = wrapper.find(DOM_MODAL_OVERLAY_BACKGROUND_SELECTOR);
      await overlayBackground.trigger('click.self.stop');

      // assert
      expect(wrapper.emitted().click).to.have.length(1);
    });

    it('emits `transitionedOut` event after leaving transition', async () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true });
      await wrapper.vm.$nextTick();

      // act
      wrapper.setProps({ show: false });
      await wrapper.vm.$nextTick();
      const transitionWrapper = wrapper.findComponent({ name: 'transition' });
      transitionWrapper.vm.$emit('after-leave');

      // assert
      expect(wrapper.emitted().transitionedOut).to.have.length(1);
    });
  });
});

function mountComponent(options?: { readonly showProperty?: boolean }) {
  return shallowMount(ModalOverlay, {
    props: options?.showProperty !== undefined ? { show: options?.showProperty } : undefined,
  });
}
