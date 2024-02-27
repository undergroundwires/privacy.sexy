import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref, nextTick, defineComponent } from 'vue';
import { useLockBodyBackgroundScroll } from '@/presentation/components/Shared/Modal/Hooks/ScrollLock/UseLockBodyBackgroundScroll';
import type { ScrollDomStateAccessor } from '@/presentation/components/Shared/Modal/Hooks/ScrollLock/ScrollDomStateAccessor';
import type { PropertyKeys } from '@/TypeHelpers';

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
  testScenarios.forEach((m) => {
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

type DomPropertyType = string | number;

interface DomStateChange {
  readonly propertyName: PropertyKeys<ScrollDomStateAccessor>;
  readonly description?: string;
  readonly prepare?: (dom: Writable<ScrollDomStateAccessor>) => void;
  getExpectedValueOnBlock(
    initialDom: Readonly<ScrollDomStateAccessor>,
    actualDom: Readonly<ScrollDomStateAccessor>,
  ): DomPropertyType;
}

const testScenarios: ReadonlyArray<DomStateChange> = [
  {
    propertyName: 'bodyStyleOverflowX',
    description: 'visible horizontal scrollbar',
    prepare: (dom) => {
      dom.htmlClientWidth = 5;
      dom.htmlScrollWidth = 10;
    },
    getExpectedValueOnBlock: () => 'scroll',
  },
  {
    propertyName: 'bodyStyleOverflowX',
    description: 'invisible horizontal scrollbar',
    prepare: (dom) => {
      dom.htmlClientWidth = 10;
      dom.htmlScrollWidth = 5;
    },
    getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleOverflowX,
  },
  {
    propertyName: 'bodyStyleOverflowY',
    description: 'visible vertical scrollbar',
    prepare: (dom) => {
      dom.htmlScrollHeight = 10;
      dom.htmlClientHeight = 5;
    },
    getExpectedValueOnBlock: () => 'scroll',
  },
  {
    propertyName: 'bodyStyleOverflowY',
    description: 'invisible vertical scrollbar',
    prepare: (dom) => {
      dom.htmlScrollHeight = 5;
      dom.htmlClientHeight = 10;
    },
    getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleOverflowY,
  },
  {
    propertyName: 'htmlScrollLeft',
    getExpectedValueOnBlock: (initialDom) => initialDom.htmlScrollLeft,
  },
  {
    propertyName: 'htmlScrollTop',
    getExpectedValueOnBlock: (initialDom) => initialDom.htmlScrollTop,
  },
  {
    propertyName: 'bodyStyleLeft',
    description: 'adjusts for scrolled position',
    prepare: (dom) => {
      dom.htmlScrollLeft = 22;
    },
    getExpectedValueOnBlock: () => '-22px',
  },
  {
    propertyName: 'bodyStyleLeft',
    description: 'unaffected by no horizontal scroll',
    prepare: (dom) => {
      dom.htmlScrollLeft = 0;
    },
    getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleLeft,
  },
  {
    propertyName: 'bodyStyleTop',
    description: 'adjusts for scrolled position',
    prepare: (dom) => {
      dom.htmlScrollTop = 12;
    },
    getExpectedValueOnBlock: () => '-12px',
  },
  {
    propertyName: 'bodyStyleTop',
    description: 'unaffected by no vertical scroll',
    prepare: (dom) => {
      dom.htmlScrollTop = 0;
    },
    getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleTop,
  },
  {
    propertyName: 'bodyStylePosition',
    getExpectedValueOnBlock: () => 'fixed',
  },
  {
    propertyName: 'bodyStyleWidth',
    description: 'no margin',
    getExpectedValueOnBlock: () => '100%',
  },
  {
    propertyName: 'bodyStyleWidth',
    description: 'margin on left',
    prepare: (dom) => {
      dom.bodyComputedMarginLeft = '3px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (3px))',
  },
  {
    propertyName: 'bodyStyleWidth',
    description: 'margin on right',
    prepare: (dom) => {
      dom.bodyComputedMarginRight = '4px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (4px))',
  },
  {
    propertyName: 'bodyStyleWidth',
    description: 'margin on left and right',
    prepare: (dom) => {
      dom.bodyComputedMarginLeft = '5px';
      dom.bodyComputedMarginRight = '5px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px))',
  },
  {
    propertyName: 'bodyStyleHeight',
    description: 'no margin',
    getExpectedValueOnBlock: () => '100%',
  },
  {
    propertyName: 'bodyStyleHeight',
    description: 'margin on top',
    prepare: (dom) => {
      dom.bodyComputedMarginTop = '3px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (3px))',
  },
  {
    propertyName: 'bodyStyleHeight',
    description: 'margin on bottom',
    prepare: (dom) => {
      dom.bodyComputedMarginBottom = '4px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (4px))',
  },
  {
    propertyName: 'bodyStyleHeight',
    description: 'margin on top and bottom',
    prepare: (dom) => {
      dom.bodyComputedMarginTop = '5px';
      dom.bodyComputedMarginBottom = '5px';
    },
    getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px))',
  },
];

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
  };
}

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};
