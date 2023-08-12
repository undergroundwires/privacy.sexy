import 'mocha';
import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import ModalContainer from '@/presentation/components/Shared/Modal/ModalContainer.vue';

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
    it('opens when model prop changes from false to true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: false });

      // act
      await wrapper.setProps({ value: true });

      // assert after updating props
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).isRendered).to.equal(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).isOpen).to.equal(true);
    });

    it('closes when model prop changes from true to false', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });

      // act
      await wrapper.setProps({ value: false });

      // assert after updating props
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).isOpen).to.equal(false);
      // isRendered will not be true directly due to transition
    });

    it('closes on pressing ESC key', async () => {
      // arrange
      const { triggerKeyUp, restore } = createWindowEventSpies();
      const wrapper = mountComponent({ modelValue: true });

      // act
      const escapeEvent = new KeyboardEvent('keyup', { key: 'Escape' });
      triggerKeyUp(escapeEvent);
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted().input[0]).to.deep.equal([false]);
      restore();
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
      expect(wrapper.emitted().input[0]).to.deep.equal([false]);
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
      expect(wrapper.emitted().input).to.equal(undefined);
    });

    it('closes on overlay click if prop is true', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true, closeOnOutsideClick: true });

      // act
      const overlayMock = wrapper.findComponent({ name: COMPONENT_MODAL_OVERLAY_NAME });
      overlayMock.vm.$emit('click');
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted().input[0]).to.deep.equal([false]);
    });
  });
});

function mountComponent(options: {
  readonly modelValue: boolean,
  readonly closeOnOutsideClick?: boolean,
  readonly slotHtml?: string,
  readonly attachToDocument?: boolean,
}) {
  return shallowMount(ModalContainer as unknown, {
    propsData: {
      value: options.modelValue,
      ...(options.closeOnOutsideClick !== undefined ? {
        closeOnOutsideClick: options.closeOnOutsideClick,
      } : {}),
    },
    slots: options.slotHtml !== undefined ? { default: options.slotHtml } : undefined,
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
  });
}

function createWindowEventSpies() {
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  let savedListener: EventListenerOrEventListenerObject | null = null;

  window.addEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void => {
    if (type === 'keyup' && typeof listener === 'function') {
      savedListener = listener;
    }
    originalAddEventListener.call(window, type, listener, options);
  };

  window.removeEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void => {
    if (type === 'keyup' && typeof listener === 'function') {
      savedListener = null;
    }
    originalRemoveEventListener.call(window, type, listener, options);
  };

  return {
    triggerKeyUp: (event: KeyboardEvent) => {
      if (savedListener) {
        (savedListener as EventListener)(event);
      }
    },
    restore: () => {
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
    },
  };
}
