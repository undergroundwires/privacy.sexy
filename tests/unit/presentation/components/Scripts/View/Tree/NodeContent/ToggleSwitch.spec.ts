import { describe, it, expect } from 'vitest';
import {
  VueWrapper, shallowMount,
  mount,
} from '@vue/test-utils';
import { nextTick, defineComponent } from 'vue';
import ToggleSwitch from '@/presentation/components/Scripts/View/Tree/NodeContent/ToggleSwitch.vue';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

const DOM_INPUT_TOGGLE_CHECKBOX_SELECTOR = 'input.toggle-input';
const DOM_INPUT_TOGGLE_LABEL_OFF_SELECTOR = '.label-off';
const DOM_INPUT_TOGGLE_LABEL_ON_SELECTOR = '.label-on';
const DOM_INPUT_CIRCLE_ICON_SELECTOR = '.circle';

describe('ToggleSwitch.vue', () => {
  describe('initial state', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly initialValue: boolean;
    }> = [
      {
        initialValue: false,
        description: 'unchecked for false',
      },
      {
        initialValue: true,
        description: 'checked for true',
      },
    ];
    testScenarios.forEach(({ initialValue, description }) => {
      it(`renders as ${description}`, () => {
        // arrange
        const expectedState = initialValue;

        // act
        const wrapper = mountComponent({
          properties: {
            modelValue: initialValue,
          },
        });
        const { checkboxElement } = getCheckboxElement(wrapper);

        // assert
        expect(checkboxElement.checked).to.equal(expectedState);
      });
    });
  });
  describe('label rendering', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly initialValue: boolean;
      readonly selector: string;
    }> = [
      {
        description: 'off label',
        initialValue: false,
        selector: DOM_INPUT_TOGGLE_LABEL_OFF_SELECTOR,
      },
      {
        description: 'on label',
        initialValue: true,
        selector: DOM_INPUT_TOGGLE_LABEL_ON_SELECTOR,
      },
    ];
    testScenarios.forEach(({ selector, initialValue, description }) => {
      it(description, () => {
        // arrange
        const expectedLabel = 'expected-test-label';

        // act
        const wrapper = mountComponent({
          properties: {
            label: expectedLabel,
            modelValue: initialValue,
          },
        });

        // assert
        const element = wrapper.find(selector);
        expect(element.exists()).to.equal(true, formatAssertionMessage([
          `Selector "${selector}" could not find the DOM element`,
          `HTML:\n${wrapper.html()}`,
        ]));
        expect(element.text()).to.equal(expectedLabel);
      });
    });
  });
  describe('model updates', () => {
    describe('emission on change', () => {
      const testScenarios: ReadonlyArray<{
        readonly initialValue: boolean;
        readonly newCheckValue: boolean;
      }> = [
        {
          initialValue: true,
          newCheckValue: false,
        },
        {
          initialValue: false,
          newCheckValue: true,
        },
      ];
      testScenarios.forEach(({ initialValue, newCheckValue }) => {
        it(`emits ${newCheckValue} when initial value is ${initialValue} and checkbox value changes`, async () => {
          // arrange
          const wrapper = mountComponent({
            properties: {
              modelValue: initialValue,
            },
          });
          const { checkboxWrapper } = getCheckboxElement(wrapper);

          // act
          await checkboxWrapper.setValue(newCheckValue);
          await nextTick();

          // assert
          expect(wrapper.emitted('update:modelValue')).to.deep.equal([[newCheckValue]]);
        });
      });
    });
    describe('no emission on identical value', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly value: boolean;
      }> = [
        {
          value: true,
          description: 'true',
        },
        {
          value: false,
          description: 'false',
        },
      ];
      testScenarios.forEach(({ value, description }) => {
        it(`does not emit for an unchanged value of ${description}`, async () => {
          // arrange
          const wrapper = mountComponent({
            properties: {
              modelValue: value,
            },
          });
          const { checkboxWrapper } = getCheckboxElement(wrapper);

          // act
          await checkboxWrapper.setValue(value);
          await nextTick();

          // assert
          expect(wrapper.emitted('update:modelValue')).to.deep.equal(undefined);
        });
      });
    });
    it('emits when the circle icon is clicked', async () => { // Regression test for unresponsive circle icon
      // arrange
      const initialCheckValue = false;
      const expectedCheckValue = true;
      const wrapper = mountComponent({
        properties: {
          modelValue: initialCheckValue,
        },
      });
      // act
      const circleIcon = wrapper.find(DOM_INPUT_CIRCLE_ICON_SELECTOR);
      await circleIcon.trigger('click');
      // assert
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[expectedCheckValue]]);
    });
  });

  describe('click propagation', () => {
    it('stops propagation if `stopClickPropagation` is true', async () => {
      // arrange
      const { wrapper: parentWrapper, parentClickEventName } = mountToggleSwitchParent(
        { stopClickPropagation: true },
      );
      const switchWrapper = parentWrapper.getComponent(ToggleSwitch);

      // act
      switchWrapper.trigger('click');
      await nextTick();

      // assert
      const receivedEvents = parentWrapper.emitted(parentClickEventName);
      expect(receivedEvents).to.equal(undefined);
    });
    it('allows propagation if `stopClickPropagation` is false', async () => {
      // arrange
      const { wrapper: parentWrapper, parentClickEventName } = mountToggleSwitchParent(
        { stopClickPropagation: false },
      );
      const switchWrapper = parentWrapper.getComponent(ToggleSwitch);

      // act
      switchWrapper.trigger('click');
      await nextTick();

      // assert
      const receivedEvents = parentWrapper.emitted(parentClickEventName);
      expect(receivedEvents).to.have.lengthOf(1);
    });
  });
});

function getCheckboxElement(wrapper: VueWrapper) {
  const checkboxWrapper = wrapper.find(DOM_INPUT_TOGGLE_CHECKBOX_SELECTOR);
  const checkboxElement = checkboxWrapper.element as HTMLInputElement;
  return {
    checkboxWrapper,
    checkboxElement,
  };
}

function mountComponent(options?: {
  readonly properties?: {
    readonly modelValue?: boolean,
    readonly label?: string,
    readonly stopClickPropagation?: boolean,
  }
}) {
  const wrapper = shallowMount(ToggleSwitch, {
    props: {
      modelValue: options?.properties?.modelValue,
      label: options?.properties?.label ?? 'test-label',
      stopClickPropagation: options?.properties?.stopClickPropagation,
    },
  });
  return wrapper;
}

function mountToggleSwitchParent(options?: {
  readonly stopClickPropagation?: boolean,
}) {
  const parentClickEventName = 'parent-clicked';
  const parentComponent = defineComponent({
    components: {
      ToggleSwitch,
    },
    emits: [parentClickEventName],
    setup(_, { emit }) {
      const stopClickPropagation = options?.stopClickPropagation;

      function handleParentClick() {
        emit(parentClickEventName);
      }

      return {
        handleParentClick,
        stopClickPropagation,
      };
    },
    template: `
      <div @click="handleParentClick">
        <ToggleSwitch
          :stopClickPropagation="stopClickPropagation"
          :label="'test-label'"
        />
      </div>
    `,
  });
  const wrapper = mount(
    parentComponent,
    {
      global: {
        stubs: { ToggleSwitch: false },
      },
    },
  );
  return {
    wrapper,
    parentClickEventName,
  };
}
