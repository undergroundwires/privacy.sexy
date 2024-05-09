import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref, nextTick, defineComponent } from 'vue';
import { useLockBodyBackgroundScroll } from '@/presentation/components/Shared/Modal/Hooks/ScrollLock/UseLockBodyBackgroundScroll';
import type { ScrollDomStateAccessor } from '@/presentation/components/Shared/Modal/Hooks/ScrollLock/ScrollDomStateAccessor';
import { DomStateChangeTestScenarios } from './DomStateChangeTestScenarios';

describe('useLockBodyBackgroundScroll', () => {
  describe('initialization', () => {
    describe('activates scroll lock when initially active', () => {
      itEachScrollBlockEffect(async (dom) => {
        // arrange
        const isInitiallyActive = true;

        // act
        createComponent(isInitiallyActive, dom);
        await nextTick();
      });
    });
    it('maintains initial styles when initially inactive', async () => {
      // arrange
      const isInitiallyActive = false;

      // act
      const { initialDomState, actualDomState } = createComponent(isInitiallyActive);
      await nextTick();

      // assert
      expect(actualDomState).to.deep.equal(initialDomState);
    });
  });
  describe('toggling scroll lock', () => {
    describe('enforces scroll lock when activated', async () => {
      itEachScrollBlockEffect(async (dom) => {
        // arrange
        const isInitiallyActive = false;
        const { isActive } = createComponent(isInitiallyActive, dom);

        // act
        isActive.value = true;
        await nextTick();
      });
    });
    it('reverts to initial styles when deactivated', async () => {
      // arrange
      const isInitiallyActive = true;
      const { isActive, initialDomState, actualDomState } = createComponent(isInitiallyActive);

      // act
      isActive.value = false;
      await nextTick();

      // assert
      expect(actualDomState).to.deep.equal(initialDomState);
    });
  });
  it('restores original styles on unmount', async () => {
    // arrange
    const isInitiallyActive = true;
    const { component, initialDomState, actualDomState } = createComponent(isInitiallyActive);

    // act
    component.unmount();
    await nextTick();

    // assert
    expect(actualDomState).to.deep.equal(initialDomState);
  });
});

function createComponent(
  initialIsActiveValue: boolean,
  dom?: ScrollDomStateAccessor,
) {
  const actualDomState = dom ?? createMockDomStateAccessor();
  const initialDomState = { ...actualDomState };
  const isActive = ref(initialIsActiveValue);
  const component = shallowMount(defineComponent({
    setup() {
      useLockBodyBackgroundScroll(isActive, actualDomState);
    },
    template: '<div></div>',
  }));
  return {
    component, isActive, initialDomState, actualDomState,
  };
}

function itEachScrollBlockEffect(act: (dom: ScrollDomStateAccessor) => Promise<void>) {
  DomStateChangeTestScenarios.forEach((m) => {
    const description = m.description ? ` (${m.description})` : '';
    it(`handles '${m.propertyName}'${description}`, async () => {
      // arrange
      const dom = createMockDomStateAccessor();
      const initialDom = { ...dom };
      if (m.prepare) {
        m.prepare(dom);
      }
      // act
      await act(dom);
      // assert
      const expectedValue = m.getExpectedValueOnBlock(initialDom, dom);
      const actualValue = dom[m.propertyName];
      expect(actualValue).to.equal(expectedValue);
    });
  });
}

function createMockDomStateAccessor(): ScrollDomStateAccessor {
  return {
    bodyStyleOverflowX: '',
    bodyStyleOverflowY: '',
    htmlScrollLeft: 0,
    htmlScrollTop: 0,
    bodyStyleLeft: '',
    bodyStyleTop: '',
    bodyStylePosition: '',
    bodyStyleWidth: '',
    bodyStyleHeight: '',
    bodyComputedMarginLeft: '',
    bodyComputedMarginRight: '',
    bodyComputedMarginTop: '',
    bodyComputedMarginBottom: '',
    htmlScrollWidth: 0,
    htmlScrollHeight: 0,
    htmlClientWidth: 0,
    htmlClientHeight: 0,
    htmlOffsetHeight: 0,
    htmlOffsetWidth: 0,
  };
}
