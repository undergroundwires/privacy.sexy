import {
  describe, it, expect, afterEach,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ModalContainer from '@/presentation/components/Shared/Modal/ModalContainer.vue';
import { createWindowEventSpies } from '@tests/shared/Spies/WindowEventSpies';

const DOM_MODAL_CONTAINER_SELECTOR = '.modal-container';
const COMPONENT_MODAL_OVERLAY_NAME = 'ModalOverlay';
const COMPONENT_MODAL_CONTENT_NAME = 'ModalContent';

describe('ModalContainer.vue', () => {
  describe('rendering based on model prop', () => {
    it('does not render when model prop is absent or false', () => {
      // arrange
      const wrapper = mountComponent({ modelValue: false });

      // act
      const modalContainer = wrapper.find(DOM_MODAL_CONTAINER_SELECTOR);

      // assert
      expect(modalContainer.exists()).to.equal(false);
    });

    it('renders modal container when model prop is true', () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });

      // act
      const modalContainer = wrapper.find(DOM_MODAL_CONTAINER_SELECTOR);

      // assert
      expect(modalContainer.exists()).to.equal(true);
    });
  });

  describe('modal open/close', () => {
    it('renders the model when prop changes from false to true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: false });

      // act
      await wrapper.setProps({ modelValue: true });

      // assert
      expect(wrapper.vm.isRendered).to.equal(true);
    });

    it('opens the model when prop changes from false to true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: false });

      // act
      await wrapper.setProps({ modelValue: true });
      await nextTick();

      // assert
      expect(wrapper.vm.isOpen).to.equal(true);
    });

    it('closes when model prop changes from true to false', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });

      // act
      await wrapper.setProps({ modelValue: false });

      // assert
      expect(wrapper.vm.isOpen).to.equal(false);
      // isRendered will not be true directly due to transition
    });

    it('closes on pressing ESC key', async () => {
      // arrange
      createWindowEventSpies(afterEach);
      const wrapper = mountComponent({ modelValue: true });

      // act
      const escapeEvent = new KeyboardEvent('keyup', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
    });

    it('emit false value after overlay and content transitions out and model prop is true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });
      const overlayMock = wrapper.findComponent({ name: COMPONENT_MODAL_OVERLAY_NAME });
      const contentMock = wrapper.findComponent({ name: COMPONENT_MODAL_CONTENT_NAME });

      // act
      overlayMock.vm.$emit('transitionedOut');
      contentMock.vm.$emit('transitionedOut');
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
    });
  });

  it('renders provided slot content', () => {
    // arrange
    const expectedText = 'Slot content';
    const slotContentClass = 'slot-content';

    // act
    const wrapper = mountComponent({
      modelValue: true,
      slotHtml: `<div class="${slotContentClass}">${expectedText}</div>`,
    });

    // assert
    const slotWrapper = wrapper.find(`.${slotContentClass}`);
    const slotText = slotWrapper.text();
    expect(slotText).to.equal(expectedText);
  });

  describe('closeOnOutsideClick', () => {
    it('does not close on overlay click if prop is false', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true, closeOnOutsideClick: false });

      // act
      const overlayMock = wrapper.findComponent({ name: COMPONENT_MODAL_OVERLAY_NAME });
      overlayMock.vm.$emit('click');
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });

    it('closes on overlay click if prop is true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true, closeOnOutsideClick: true });

      // act
      const overlayMock = wrapper.findComponent({ name: COMPONENT_MODAL_OVERLAY_NAME });
      overlayMock.vm.$emit('click');
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
    });
  });
});

function mountComponent(options: {
  readonly modelValue: boolean,
  readonly closeOnOutsideClick?: boolean,
  readonly slotHtml?: string,
  readonly attachToDocument?: boolean,
}) {
  return shallowMount(ModalContainer, {
    props: {
      modelValue: options.modelValue,
      ...(options.closeOnOutsideClick !== undefined ? {
        closeOnOutsideClick: options.closeOnOutsideClick,
      } : {}),
    },
    slots: options.slotHtml !== undefined ? { default: options.slotHtml } : undefined,
    global: {
      stubs: {
        [COMPONENT_MODAL_OVERLAY_NAME]: {
          name: COMPONENT_MODAL_OVERLAY_NAME,
          template: '<div />',
        },
        [COMPONENT_MODAL_CONTENT_NAME]: {
          name: COMPONENT_MODAL_CONTENT_NAME,
          template: '<slot />',
        },
      },
    },
  });
}
