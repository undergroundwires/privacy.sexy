import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import CodeInstruction from '@/presentation/components/Code/CodeButtons/Save/Instructions/CodeInstruction.vue';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { Clipboard } from '@/presentation/components/Shared/Hooks/Clipboard/Clipboard';
import { UseClipboardStub } from '@tests/unit/shared/Stubs/UseClipboardStub';
import { ClipboardStub } from '@tests/unit/shared/Stubs/ClipboardStub';

const DOM_SELECTOR_CODE_SLOT = 'code';
const DOM_SELECTOR_COPY_BUTTON = '.copy-button';
const COMPONENT_TOOLTIP_WRAPPER_NAME = 'TooltipWrapper';

describe('CodeInstruction.vue', () => {
  it('renders a slot content inside a <code> element', () => {
    // arrange
    const expectedSlotContent = 'Example Code';
    const wrapper = mountComponent({
      slotContent: expectedSlotContent,
    });
    // act
    const codeSlot = wrapper.find(DOM_SELECTOR_CODE_SLOT);
    const actualContent = codeSlot.text();
    // assert
    expect(actualContent).to.equal(expectedSlotContent);
  });
  describe('copy', () => {
    it('calls copyText when the copy button is clicked', async () => {
      // arrange
      const expectedCode = 'Code to be copied';
      const clipboardStub = new ClipboardStub();
      const wrapper = mountComponent({
        clipboard: clipboardStub,
      });
      wrapper.vm.codeElement = { textContent: expectedCode } as HTMLElement;
      // act
      const copyButton = wrapper.find(DOM_SELECTOR_COPY_BUTTON);
      await copyButton.trigger('click');
      // assert
      const calls = clipboardStub.callHistory;
      expect(calls).to.have.lengthOf(1);
      const call = calls.find((c) => c.methodName === 'copyText');
      expect(call).toBeDefined();
      const [actualCode] = call.args;
      expect(actualCode).to.equal(expectedCode);
    });
    it('throws an error when codeElement is not found during copy', async () => {
      // arrange
      const expectedError = 'Code element could not be found.';
      const wrapper = mountComponent();
      wrapper.vm.codeElement = undefined;
      // act
      const act = () => wrapper.vm.copyCode();
      // assert
      await expectThrowsAsync(act, expectedError);
    });
    it('throws an error when codeElement has no textContent during copy', async () => {
      // arrange
      const expectedError = 'Code element does not contain any text.';
      const wrapper = mountComponent();
      wrapper.vm.codeElement = { textContent: '' } as HTMLElement;
      // act
      const act = () => wrapper.vm.copyCode();
      // assert
      await expectThrowsAsync(act, expectedError);
    });
  });
});

function mountComponent(options?: {
  readonly clipboard?: Clipboard,
  readonly slotContent?: string,
}) {
  return shallowMount(CodeInstruction, {
    global: {
      provide: {
        [InjectionKeys.useClipboard.key]:
          () => {
            if (options?.clipboard) {
              return new UseClipboardStub(options.clipboard).get();
            }
            return new UseClipboardStub().get();
          },
      },
      stubs: {
        [COMPONENT_TOOLTIP_WRAPPER_NAME]: {
          name: COMPONENT_TOOLTIP_WRAPPER_NAME,
          template: '<slot />',
        },
      },
    },
    slots: {
      default: options?.slotContent ?? 'Stubbed slot content',
    },
  });
}
