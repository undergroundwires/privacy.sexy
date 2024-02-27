import { type Ref, onBeforeUnmount, watch } from 'vue';
import { getWindowDomState } from './WindowScrollDomStateAccessor';
import type { ScrollDomStateAccessor } from './ScrollDomStateAccessor';

export function useLockBodyBackgroundScroll(
  isActive: Ref<boolean>,
  dom: ScrollDomStateAccessor = getWindowDomState(),
) {
  let isBlocked = false;

  const applyScrollLock = () => {
    ScrollLockMutators.forEach((mutator) => {
      mutator.onBeforeBlock(dom);
    });
    ScrollLockMutators.forEach((mutator) => {
      mutator.onBlock(dom);
    });
    isBlocked = true;
  };

  function revertScrollLock() {
    if (!isBlocked) {
      return;
    }
    ScrollLockMutators.forEach((mutator) => {
      mutator.onUnblock(dom);
    });
  }

  watch(isActive, (shouldBlock) => {
    if (shouldBlock) {
      applyScrollLock();
    } else {
      revertScrollLock();
    }
  }, { immediate: true });

  onBeforeUnmount(() => {
    revertScrollLock();
  });
}

interface ScrollStateManipulator {
  onBeforeBlock(dom: ScrollDomStateAccessor): void;
  onBlock(dom: ScrollDomStateAccessor): void;
  onUnblock(dom: ScrollDomStateAccessor): void;
}

function createScrollStateManipulator<TStoredState>(
  propertyMutator: DomPropertyMutator<TStoredState>,
): ScrollStateManipulator {
  let state: TStoredState | undefined;
  let restoreAction: ScrollRevertAction | undefined;
  return {
    onBeforeBlock: (dom) => {
      state = propertyMutator.storeInitialState(dom);
    },
    onBlock: (dom) => {
      verifyStateInitialization(state);
      restoreAction = propertyMutator.onBlock(state, dom);
    },
    onUnblock: (dom) => {
      switch (restoreAction) {
        case ScrollRevertAction.RestoreRequired:
          verifyStateInitialization(state);
          propertyMutator.restoreStateOnUnblock(state, dom);
          break;
        case ScrollRevertAction.SkipRestore:
          return;
        case undefined:
          throw new Error('Undefined restore action');
        default:
          throw new Error(`Unknown action: ${ScrollRevertAction[restoreAction]}`);
      }
    },
  };
}

function verifyStateInitialization<TState>(
  value: TState | undefined,
): asserts value is TState {
  if (value === null || value === undefined) {
    throw new Error('Previous state not found. Ensure state initialization before mutation operations.');
  }
}

const HtmlScrollLeft: DomPropertyMutator<{
  readonly htmlScrollLeft: number;
}> = {
  storeInitialState: (dom) => ({
    htmlScrollLeft: dom.htmlScrollLeft,
  }),
  onBlock: () => ScrollRevertAction.RestoreRequired,
  restoreStateOnUnblock: (initialState, dom) => {
    dom.htmlScrollLeft = initialState.htmlScrollLeft;
  },
};

const BodyStyleLeft: DomPropertyMutator<{
  readonly htmlScrollLeft: number;
  readonly bodyStyleLeft: string;
}> = {
  storeInitialState: (dom) => ({
    htmlScrollLeft: dom.htmlScrollLeft,
    bodyStyleLeft: dom.bodyStyleLeft,
    bodyMarginLeft: dom.bodyComputedMarginLeft,
  }),
  onBlock: (initialState, dom) => {
    if (initialState.htmlScrollLeft === 0) {
      return ScrollRevertAction.SkipRestore;
    }
    dom.bodyStyleLeft = `-${initialState.htmlScrollLeft}px`;
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleLeft = initialState.bodyStyleLeft;
  },
};

const BodyStyleTop: DomPropertyMutator<{
  readonly htmlScrollTop: number;
  readonly bodyStyleTop: string;
}> = {
  storeInitialState: (dom) => ({
    bodyStyleTop: dom.bodyStyleTop,
    htmlScrollTop: dom.htmlScrollTop,
  }),
  onBlock: (initialState, dom) => {
    if (initialState.htmlScrollTop === 0) {
      return ScrollRevertAction.SkipRestore;
    }
    dom.bodyStyleTop = `-${initialState.htmlScrollTop}px`;
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleTop = initialState.bodyStyleTop;
  },
};

const BodyStyleOverflowX: DomPropertyMutator<{
  readonly isHorizontalScrollbarVisible: boolean;
  readonly bodyStyleOverflowX: string;
}> = {
  storeInitialState: (dom) => ({
    isHorizontalScrollbarVisible: dom.htmlScrollWidth > dom.htmlClientWidth,
    bodyStyleOverflowX: dom.bodyStyleOverflowX,
  }),
  onBlock: (initialState, dom) => {
    if (!initialState.isHorizontalScrollbarVisible) {
      return ScrollRevertAction.SkipRestore;
    }
    dom.bodyStyleOverflowX = 'scroll';
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleOverflowX = initialState.bodyStyleOverflowX;
  },
};

const BodyStyleOverflowY: DomPropertyMutator<{
  readonly isVerticalScrollbarVisible: boolean;
  readonly bodyStyleOverflowY: string;
}> = {
  storeInitialState: (dom) => ({
    isVerticalScrollbarVisible: dom.htmlScrollHeight > dom.htmlClientHeight,
    bodyStyleOverflowY: dom.bodyStyleOverflowY,
  }),
  onBlock: (initialState, dom) => {
    if (!initialState.isVerticalScrollbarVisible) {
      return ScrollRevertAction.SkipRestore;
    }
    dom.bodyStyleOverflowY = 'scroll';
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleOverflowY = initialState.bodyStyleOverflowY;
  },
};

const HtmlScrollTop: DomPropertyMutator<{
  readonly htmlScrollTop: number;
}> = {
  storeInitialState: (dom) => ({
    htmlScrollTop: dom.htmlScrollTop,
  }),
  onBlock: () => ScrollRevertAction.RestoreRequired,
  restoreStateOnUnblock: (initialState, dom) => {
    dom.htmlScrollTop = initialState.htmlScrollTop;
  },
};

const BodyPositionFixed: DomPropertyMutator<{
  readonly bodyStylePosition: string;
}> = {
  storeInitialState: (dom) => ({
    bodyStylePosition: dom.bodyStylePosition,
  }),
  onBlock: (_, dom) => {
    dom.bodyStylePosition = 'fixed';
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStylePosition = initialState.bodyStylePosition;
  },
};

const BodyWidth100Percent: DomPropertyMutator<{
  readonly bodyStyleWidth: string;
}> = {
  storeInitialState: (dom) => ({
    bodyStyleWidth: dom.bodyStyleWidth,
  }),
  onBlock: (_, dom) => {
    dom.bodyStyleWidth = calculateBodyViewportStyleWithMargins(
      [dom.bodyComputedMarginLeft, dom.bodyComputedMarginRight],
    );
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleWidth = initialState.bodyStyleWidth;
  },
};

const BodyHeight100Percent: DomPropertyMutator<{
  readonly bodyStyleHeight: string;
}> = {
  storeInitialState: (dom) => ({
    bodyStyleHeight: dom.bodyStyleHeight,
  }),
  onBlock: (_, dom) => {
    dom.bodyStyleHeight = calculateBodyViewportStyleWithMargins(
      [dom.bodyComputedMarginTop, dom.bodyComputedMarginBottom],
    );
    return ScrollRevertAction.RestoreRequired;
  },
  restoreStateOnUnblock: (initialState, dom) => {
    dom.bodyStyleHeight = initialState.bodyStyleHeight;
  },
};

const ScrollLockMutators: readonly ScrollStateManipulator[] = [
  createScrollStateManipulator(BodyPositionFixed), // Fix body position
  /*
    Using `position: 'fixed'` to lock background scroll.
    This approach is chosen over:
    1. `overflow: 'hidden'`: It hides the scrollbar, causing layout "jumps".
      `scrollbar-gutter` can fix it but it lacks Safari support and introduces
      complexity of positioning calculations on modal.
    2. `overscrollBehavior`: Only stops scrolling at scroll limits, not suitable for all cases.
    3. `touchAction: none`: Ineffective on non-touch (desktop) devices.
  */
  ...[ // Keep the scrollbar visible
    createScrollStateManipulator(BodyStyleOverflowX), // Horizontal scrollbar
    createScrollStateManipulator(BodyStyleOverflowY), // Vertical scrollbar
  ],
  ...[ // Fix scroll-to-top issue
    // Horizontal
    createScrollStateManipulator(HtmlScrollLeft), // Restore scroll position
    createScrollStateManipulator(BodyStyleLeft), // Keep the body on scrolled position
    // // Vertical
    createScrollStateManipulator(HtmlScrollTop), // Restore scroll position
    createScrollStateManipulator(BodyStyleTop), // Keep the body on scrolled position
  ],
  ...[ // Fix layout-shift on very large screens
    // Using percentages instead of viewport allows content to grow if the content
    // exceeds the viewport.
    createScrollStateManipulator(BodyWidth100Percent),
    createScrollStateManipulator(BodyHeight100Percent),
  ],
] as const;

enum ScrollRevertAction {
  RestoreRequired,
  SkipRestore,
}

interface DomPropertyMutator<TInitialStateValue> {
  storeInitialState(dom: ScrollDomStateAccessor): TInitialStateValue;
  onBlock(storedState: TInitialStateValue, dom: ScrollDomStateAccessor): ScrollRevertAction;
  restoreStateOnUnblock(storedState: TInitialStateValue, dom: ScrollDomStateAccessor): void;
}

function calculateBodyViewportStyleWithMargins(
  margins: readonly string[],
): string {
  let value = '100%';
  const calculatedMargin = margins
    .filter((marginText) => marginText.length > 0)
    .join(' + '); // without setting margins, it leads to layout shift if body has margin
  if (calculatedMargin) {
    value = `calc(${value} - (${calculatedMargin}))`;
  }
  return value;
}
