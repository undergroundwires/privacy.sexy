import type { PropertyKeys } from '@/TypeHelpers';
import type { ScrollDomStateAccessor } from '@/presentation/components/Shared/Modal/Hooks/ScrollLock/ScrollDomStateAccessor';

export const DomStateChangeTestScenarios: readonly DomStateChangeTestScenario[] = [
  ...createScenariosForProperty('bodyStyleOverflowX', [
    {
      description: 'visible horizontal scrollbar',
      prepare: (dom) => {
        dom.htmlClientWidth = 5;
        dom.htmlScrollWidth = 10;
      },
      getExpectedValueOnBlock: () => 'scroll',
    },
    {
      description: 'invisible horizontal scrollbar',
      prepare: (dom) => {
        dom.htmlClientWidth = 10;
        dom.htmlScrollWidth = 5;
      },
      getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleOverflowX,
    },
  ]),
  ...createScenariosForProperty('bodyStyleOverflowY', [
    {
      description: 'visible vertical scrollbar',
      prepare: (dom) => {
        dom.htmlScrollHeight = 10;
        dom.htmlClientHeight = 5;
      },
      getExpectedValueOnBlock: () => 'scroll',
    },
    {
      description: 'invisible vertical scrollbar',
      prepare: (dom) => {
        dom.htmlScrollHeight = 5;
        dom.htmlClientHeight = 10;
      },
      getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleOverflowY,
    },
  ]),
  {
    propertyName: 'htmlScrollLeft',
    getExpectedValueOnBlock: (initialDom) => initialDom.htmlScrollLeft,
  },
  {
    propertyName: 'htmlScrollTop',
    getExpectedValueOnBlock: (initialDom) => initialDom.htmlScrollTop,
  },
  ...createScenariosForProperty('bodyStyleLeft', [
    {
      description: 'adjusts for scrolled position',
      prepare: (dom) => {
        dom.htmlScrollLeft = 22;
      },
      getExpectedValueOnBlock: () => '-22px',
    },
    {
      description: 'unaffected by no horizontal scroll',
      prepare: (dom) => {
        dom.htmlScrollLeft = 0;
      },
      getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleLeft,
    },
  ]),
  ...createScenariosForProperty('bodyStyleTop', [
    {
      description: 'adjusts for scrolled position',
      prepare: (dom) => {
        dom.htmlScrollTop = 12;
      },
      getExpectedValueOnBlock: () => '-12px',
    },
    {
      description: 'unaffected by no vertical scroll',
      prepare: (dom) => {
        dom.htmlScrollTop = 0;
      },
      getExpectedValueOnBlock: (initialDom) => initialDom.bodyStyleTop,
    },
  ]),
  {
    propertyName: 'bodyStylePosition',
    getExpectedValueOnBlock: () => 'fixed',
  },
  ...createScenariosForProperty('bodyStyleWidth', [
    {
      description: 'no margin or scrollbar gutter',
      getExpectedValueOnBlock: () => '100%',
    },
    {
      description: 'margin on left',
      prepare: (dom) => {
        dom.bodyComputedMarginLeft = '3px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (3px))',
    },
    {
      description: 'margin on right',
      prepare: (dom) => {
        dom.bodyComputedMarginRight = '4px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (4px))',
    },
    {
      description: 'margin on left and right',
      prepare: (dom) => {
        dom.bodyComputedMarginLeft = '5px';
        dom.bodyComputedMarginRight = '5px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px))',
    },
    {
      description: 'scrollbar gutter',
      prepare: (dom) => {
        dom.htmlClientWidth = 10;
        dom.htmlOffsetWidth = 4;
      },
      getExpectedValueOnBlock: () => 'calc(100% - (6px))',
    },
    {
      description: 'scrollbar gutter and margins',
      prepare: (dom) => {
        dom.htmlClientWidth = 10;
        dom.htmlOffsetWidth = 4;
        dom.bodyComputedMarginLeft = '5px';
        dom.bodyComputedMarginRight = '5px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px + 6px))',
    },
  ]),
  ...createScenariosForProperty('bodyStyleHeight', [

    {
      description: 'no margin or scrollbar gutter',
      getExpectedValueOnBlock: () => '100%',
    },
    {
      description: 'margin on top',
      prepare: (dom) => {
        dom.bodyComputedMarginTop = '3px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (3px))',
    },
    {
      description: 'margin on bottom',
      prepare: (dom) => {
        dom.bodyComputedMarginBottom = '4px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (4px))',
    },
    {
      description: 'margin on top and bottom',
      prepare: (dom) => {
        dom.bodyComputedMarginTop = '5px';
        dom.bodyComputedMarginBottom = '5px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px))',
    },
    {
      description: 'scrollbar gutter',
      prepare: (dom) => {
        dom.htmlClientHeight = 10;
        dom.htmlOffsetHeight = 4;
      },
      getExpectedValueOnBlock: () => 'calc(100% - (6px))',
    },
    {
      description: 'scrollbar gutter and margins',
      prepare: (dom) => {
        dom.htmlClientHeight = 10;
        dom.htmlOffsetHeight = 4;
        dom.bodyComputedMarginTop = '5px';
        dom.bodyComputedMarginBottom = '5px';
      },
      getExpectedValueOnBlock: () => 'calc(100% - (5px + 5px + 6px))',
    },
  ]),
] as const;

function createScenariosForProperty(
  propertyName: PropertyKeys<ScrollDomStateAccessor>,
  scenarios: readonly Omit<DomStateChangeTestScenario, 'propertyName'>[],
): DomStateChangeTestScenario[] {
  return scenarios.map((scenario): DomStateChangeTestScenario => ({
    propertyName,
    ...scenario,
  }));
}

type DomPropertyType = string | number;

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface DomStateChangeTestScenario {
  readonly propertyName: PropertyKeys<ScrollDomStateAccessor>;
  readonly description?: string;
  readonly prepare?: (dom: Writable<ScrollDomStateAccessor>) => void;
  getExpectedValueOnBlock(
    initialDom: Readonly<ScrollDomStateAccessor>,
    actualDom: Readonly<ScrollDomStateAccessor>,
  ): DomPropertyType;
}
