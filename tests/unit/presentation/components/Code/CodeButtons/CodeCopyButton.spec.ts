import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import CodeCopyButton from '@/presentation/components/Code/CodeButtons/CodeCopyButton.vue';
import { ClipboardStub } from '@tests/unit/shared/Stubs/ClipboardStub';
import { Clipboard } from '@/presentation/components/Shared/Hooks/Clipboard/Clipboard';
import { UseClipboardStub } from '@tests/unit/shared/Stubs/UseClipboardStub';
import { UseCurrentCodeStub } from '@tests/unit/shared/Stubs/UseCurrentCodeStub';

const COMPONENT_ICON_BUTTON_WRAPPER_NAME = 'IconButton';

describe('CodeCopyButton', () => {
  it('copies current code when clicked', async () => {
    // arrange
    const expectedCode = 'code to be copied';
    const clipboard = new ClipboardStub();
    const wrapper = mountComponent({
      clipboard,
      currentCode: expectedCode,
    });

    // act
    await wrapper.trigger('click');

    // assert
    const calls = clipboard.callHistory;
    expect(calls).to.have.lengthOf(1);
    const call = calls.find((c) => c.methodName === 'copyText');
    expect(call).toBeDefined();
    const [copiedText] = call.args;
    expect(copiedText).to.equal(expectedCode);
  });
});

function mountComponent(options?: {
  clipboard?: Clipboard,
  currentCode?: string,
}) {
  return shallowMount(CodeCopyButton, {
    global: {
      provide: {
        [InjectionKeys.useClipboard as symbol]: () => (
          options?.clipboard
            ? new UseClipboardStub(options.clipboard)
            : new UseClipboardStub()
        ).get(),
        [InjectionKeys.useCurrentCode as symbol]: () => (
          options.currentCode === undefined
            ? new UseCurrentCodeStub()
            : new UseCurrentCodeStub().withCurrentCode(options.currentCode)
        ).get(),
      },
      stubs: {
        [COMPONENT_ICON_BUTTON_WRAPPER_NAME]: {
          name: COMPONENT_ICON_BUTTON_WRAPPER_NAME,
          template: '<div @click="handleClick()" />',
          emits: ['click'],
          setup: (_, { emit }) => ({
            handleClick: () => emit('click'),
          }),
        },
      },
    },
  });
}
