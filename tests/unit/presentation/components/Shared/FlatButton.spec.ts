import {
  describe, it, expect,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import type { IconName } from '@/presentation/components/Shared/Icon/IconName';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { hasDirective } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';

const DOM_SELECTOR_LABEL = 'span';
const DOM_SELECTOR_BUTTON = 'button';
const DOM_CLASS_DISABLED_CLASS = 'disabled';

describe('FlatButton.vue', () => {
  describe('label', () => {
    it('renders label when provided', () => {
      // arrange
      const expectedLabel = 'expected label';

      // act
      const wrapper = mountComponent({ labelPropValue: expectedLabel });

      // assert
      const labelElement = wrapper.find(DOM_SELECTOR_LABEL);
      expect(labelElement.text()).to.equal(expectedLabel);
    });
    it('does not render label when not provided', () => {
      // arrange
      const absentLabelValue = undefined;

      // act
      const wrapper = mountComponent({ labelPropValue: absentLabelValue });

      // assert
      const labelElement = wrapper.find(DOM_SELECTOR_LABEL);
      expect(labelElement.exists()).to.equal(false);
    });
  });
  describe('icon', () => {
    it('renders icon when provided', () => {
      // arrange
      const expectedIcon: IconName = 'globe';

      // act
      const wrapper = mountComponent({ iconPropValue: expectedIcon });

      // assert
      expect(wrapper.findComponent(AppIcon).exists()).to.equal(true);
    });
    it('does not render icon when not provided', () => {
      // arrange
      const absentIconValue = undefined;

      // act
      const wrapper = mountComponent({ iconPropValue: absentIconValue });

      // assert
      expect(wrapper.findComponent(AppIcon).exists()).to.equal(false);
    });
    it('correctly binds given icon', () => {
      // arrange
      const expectedIcon: IconName = 'globe';

      // act
      const wrapper = mountComponent({ iconPropValue: expectedIcon });

      // assert
      const appIconComponent = wrapper.findComponent(AppIcon);
      expect(appIconComponent.props('icon')).toEqual(expectedIcon);
    });
  });
  describe('label + icon', () => {
    it('renders both label and icon when provided', () => {
      // arrange
      const expectedLabel = 'Test Label';
      const expectedIcon: IconName = 'globe';

      // act
      const wrapper = mountComponent({
        labelPropValue: expectedLabel,
        iconPropValue: expectedIcon,
      });

      // assert
      const labelElement = wrapper.find(DOM_SELECTOR_LABEL);
      expect(labelElement.text()).to.equal(expectedLabel);
      expect(wrapper.findComponent(AppIcon).exists()).to.equal(true);
    });
  });
  describe('disabled', () => {
    it('emits click event when enabled and clicked', async () => {
      // arrange
      const wrapper = mountComponent({ isDisabledPropValue: false });

      // act
      await wrapper.find(DOM_SELECTOR_BUTTON).trigger('click');

      // assert
      expect(wrapper.emitted().click).to.have.lengthOf(1, formatAssertionMessage([
        `Disabled prop value: ${wrapper.props('disabled')}`,
        `Emitted events: ${JSON.stringify(wrapper.emitted())}`,
        'Inner HTML:', wrapper.html(),
      ]));
    });
    it('does not emit click event when disabled and clicked', async () => {
      // arrange
      const wrapper = mountComponent({ isDisabledPropValue: true });

      // act
      await wrapper.find(DOM_SELECTOR_BUTTON).trigger('click');

      // assert
      expect(wrapper.emitted().click ?? []).to.have.lengthOf(0, formatAssertionMessage([
        `Disabled prop value: ${wrapper.props('disabled')}`,
        'Inner HTML:', wrapper.html(),
      ]));
    });
    it('applies disabled class when disabled', () => {
      // arrange & act
      const wrapper = mountComponent({ isDisabledPropValue: true });
      // assert
      const classes = wrapper.find(DOM_SELECTOR_BUTTON).classes();
      expect(classes).to.contain(DOM_CLASS_DISABLED_CLASS, formatAssertionMessage([
        `Disabled prop value: ${wrapper.props('disabled')}`,
        'Inner HTML:', wrapper.html(),
      ]));
    });
    it('does not apply disabled class when enabled', () => {
      // arrange & act
      const wrapper = mountComponent({ isDisabledPropValue: false });
      // assert
      const classes = wrapper.find(DOM_SELECTOR_BUTTON).classes();
      expect(classes).not.contain(DOM_CLASS_DISABLED_CLASS, formatAssertionMessage([
        `Disabled prop value: ${wrapper.props('disabled')}`,
        'Inner HTML:', wrapper.html(),
      ]));
    });
  });
  it('applies non-collapsing directive correctly', () => {
    // act & arrange
    const wrapper = mountComponent();

    // assert
    const button = wrapper.find(DOM_SELECTOR_BUTTON);
    const isDirectiveApplied = hasDirective(button.element);
    expect(isDirectiveApplied).to.equal(true, formatAssertionMessage([
      `Attributes: ${JSON.stringify(button.attributes())}`,
      'Button HTML:', button.html(),
    ]));
  });
});

function mountComponent(options?: {
  readonly iconPropValue?: IconName,
  readonly labelPropValue?: string,
  readonly isDisabledPropValue?: boolean,
  readonly nonCollapsingDirective?: () => void,
}) {
  return shallowMount(FlatButton, {
    props: {
      icon: options === undefined ? 'globe' : options?.iconPropValue,
      label: options === undefined ? 'stub-label' : options?.labelPropValue,
      disabled: options?.isDisabledPropValue,
    },
  });
}
