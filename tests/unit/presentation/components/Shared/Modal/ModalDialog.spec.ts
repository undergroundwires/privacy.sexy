import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';

const DOM_CLOSE_BUTTON_SELECTOR = '.dialog__close-button';
const MODAL_CONTAINER_COMPONENT_NAME = 'ModalContainer';

describe('ModalDialog.vue', () => {
  it(`renders ${MODAL_CONTAINER_COMPONENT_NAME}`, () => {
    // arrange & act
    const wrapper = mountComponent();

    // assert
    const modalContainerWrapper = wrapper.findComponent({ name: MODAL_CONTAINER_COMPONENT_NAME });
    expect(modalContainerWrapper.exists()).to.equal(true);
  });

  describe(`binds the visibility flag ${MODAL_CONTAINER_COMPONENT_NAME}`, () => {
    it('given true', () => {
      // arrange & act
      const wrapper = mountComponent({ modelValue: true });

      // assert
      const modalContainerWrapper = wrapper.findComponent({ name: MODAL_CONTAINER_COMPONENT_NAME });

      expect(modalContainerWrapper.props('modelValue')).to.equal(true);
    });
    it('given false', () => {
      // arrange & act
      const wrapper = mountComponent({ modelValue: false });

      // assert
      const modalContainerWrapper = wrapper.findComponent({ name: MODAL_CONTAINER_COMPONENT_NAME });
      expect(modalContainerWrapper.props('modelValue')).to.equal(false);
    });
  });

  describe('close button', () => {
    it('renders the close button', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });

      // act
      const closeButton = wrapper.find(DOM_CLOSE_BUTTON_SELECTOR);

      // assert
      expect(closeButton.exists()).to.equal(true);
    });

    it('closes the modal when close button is clicked', async () => {
      // arrange
      const wrapper = mountComponent({ modelValue: true });

      // act
      const closeButton = wrapper.find(DOM_CLOSE_BUTTON_SELECTOR);
      await closeButton.trigger('click');
      await wrapper.vm.$nextTick();

      // assert
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
    });
  });
});

function mountComponent(options?: {
  readonly modelValue?: boolean,
  readonly slotHtml?: string,
}) {
  const wrapper = shallowMount(ModalDialog, {
    props: {
      modelValue: options?.modelValue !== undefined
        ? options?.modelValue
        : true /* provide default value to required property */,
    },
    slots: options?.slotHtml !== undefined ? { default: options?.slotHtml } : undefined,
    global: {
      stubs: {
        [MODAL_CONTAINER_COMPONENT_NAME]: {
          name: MODAL_CONTAINER_COMPONENT_NAME,
          template: '<slot />',
          props: ['modelValue'],
        },
      },
    },
  });
  return wrapper;
}
