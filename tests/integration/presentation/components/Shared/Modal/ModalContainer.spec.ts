import {
  describe, it, expect,
} from 'vitest';
import { mount } from '@vue/test-utils';
import ModalContainer from '@/presentation/components/Shared/Modal/ModalContainer.vue';

describe('ModalContainer', () => {
  it('closes on pressing ESC key', async () => {
    // arrange
    const wrapper = mountComponent({ modelValue: true });

    // act
    const escapeEvent = new KeyboardEvent('keyup', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    // assert
    expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
  });
});

function mountComponent(options: {
  readonly modelValue: boolean,
}) {
  return mount(ModalContainer, {
    props: {
      modelValue: options.modelValue,
    },
  });
}
