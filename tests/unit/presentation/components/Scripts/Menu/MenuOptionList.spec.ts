import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import MenuOptionList from '@/presentation/components/Scripts/Menu/MenuOptionList.vue';

const DOM_SELECTOR_LABEL = '.list div:first-child:not(.items)';
const DOM_SELECTOR_SLOT = '.list .items';

describe('MenuOptionList', () => {
  it('renders the label when provided', () => {
    // arrange
    const label = 'Test label';
    const expectedLabel = `${label}:`;
    // act
    const wrapper = mountComponent({ label });
    // assert
    const labelElement = wrapper.find(DOM_SELECTOR_LABEL);
    const actualLabel = labelElement.text();
    expect(actualLabel).to.equal(expectedLabel);
  });

  it('does not render the label when not provided', () => {
    // arrange
    const label = undefined;
    // act
    const wrapper = mountComponent({ label });
    // assert
    const labelElement = wrapper.find(DOM_SELECTOR_LABEL);
    expect(labelElement.exists()).toBe(false);
  });

  it('renders default slot content', () => {
    // arrange
    const expectedSlotContent = 'Slot Content';
    // act
    const wrapper = mountComponent({ slotContent: expectedSlotContent });
    // assert
    const slotText = wrapper.find(DOM_SELECTOR_SLOT);
    expect(slotText.text()).to.equal(expectedSlotContent);
  });
});

function mountComponent(options?: {
  readonly label?: string;
  readonly slotContent?: string;
}) {
  return shallowMount(MenuOptionList, {
    props: {
      label: options?.label,
    },
    slots: {
      default: options?.slotContent ?? 'Stubbed slot content',
    },
  });
}
