import { describe, it, expect } from 'vitest';
import { VueWrapper, shallowMount } from '@vue/test-utils';
import { ComponentPublicInstance } from 'vue';
import CopyableCommand from '@/presentation/components/Code/CodeButtons/Save/RunInstructions/Steps/CopyableCommand.vue';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { Clipboard } from '@/presentation/components/Shared/Hooks/Clipboard/Clipboard';
import { UseClipboardStub } from '@tests/unit/shared/Stubs/UseClipboardStub';
import { ClipboardStub } from '@tests/unit/shared/Stubs/ClipboardStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';

const DOM_SELECTOR_CODE_SLOT = 'code > span:nth-of-type(2)';
const COMPONENT_TOOLTIP_WRAPPER_NAME = 'TooltipWrapper';

describe('CopyableCommand.vue', () => {
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
      const referencedElement = createElementWithTextContent(expectedCode);
      setSlotContainerElement(wrapper, referencedElement);
      // act
      const copyButton = wrapper.findComponent(FlatButton);
      await copyButton.trigger('click');
      // assert
      const calls = clipboardStub.callHistory;
      expect(calls).to.have.lengthOf(1);
      const call = calls.find((c) => c.methodName === 'copyText');
      expectExists(call);
      const [actualCode] = call.args;
      expect(actualCode).to.equal(expectedCode);
    });
    it('throws an error when referenced element is undefined during copy', async () => {
      // arrange
      const expectedError = 'Code element could not be found.';
      const wrapper = mountComponent();
      const referencedElement = undefined;
      setSlotContainerElement(wrapper, referencedElement);
      // act
      const act = () => wrapper.vm.copyCode();
      // assert
      await expectThrowsAsync(act, expectedError);
    });
    it('throws an error when reference element has no textContent during copy', async () => {
      // arrange
      const expectedError = 'Code element does not contain any text.';
      const wrapper = mountComponent();
      const referencedElement = createElementWithTextContent('');
      setSlotContainerElement(wrapper, referencedElement);
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
  return shallowMount(CopyableCommand, {
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

function setSlotContainerElement(
  wrapper: VueWrapper<unknown>,
  element?: HTMLElement,
) {
  (wrapper.vm as ComponentPublicInstance<typeof CopyableCommand>).copyableTextHolder = element;
}

function createElementWithTextContent(textContent: string): HTMLElement {
  const element = document.createElement('span');
  element.textContent = textContent;
  return element;
}
