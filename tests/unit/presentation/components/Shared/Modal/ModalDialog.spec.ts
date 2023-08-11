import 'mocha';
import { shallowMount, mount } from '@vue/test-utils';
import { expect } from 'chai';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import ModalContainer from '@/presentation/components/Shared/Modal/ModalContainer.vue';

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
      const wrapper = mountComponent({ modelValue: true, deepMount: true });

      // assert
      const modalContainerWrapper = wrapper.findComponent(ModalContainer);
      expect(modalContainerWrapper.props('value')).to.equal(true);
    });
    it('given false', () => {
      // arrange & act
      const wrapper = mountComponent({ modelValue: false, deepMount: true });

      // assert
      const modalContainerWrapper = wrapper.findComponent(ModalContainer);
      expect(modalContainerWrapper.props('value')).to.equal(false);
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
      expect(wrapper.emitted().input[0]).to.deep.equal([false]);
    });
  });
});

function mountComponent(options?: {
  readonly modelValue?: boolean,
  readonly slotHtml?: string,
  readonly deepMount?: boolean,
}) {
  const mountFunction = options?.deepMount === true ? mount : shallowMount;
  const wrapper = mountFunction(ModalDialog as unknown, {
    propsData: options?.modelValue !== undefined ? { value: options?.modelValue } : undefined,
    slots: options?.slotHtml !== undefined ? { default: options?.slotHtml } : undefined,
    stubs: options?.deepMount === true ? undefined : {
      [MODAL_CONTAINER_COMPONENT_NAME]: {
        name: MODAL_CONTAINER_COMPONENT_NAME,
        template: '<slot />',
      },
    },
  });
  return wrapper;
}
