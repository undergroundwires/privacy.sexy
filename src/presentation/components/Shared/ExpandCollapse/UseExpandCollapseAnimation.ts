import { PlatformTimer } from '@/application/Common/Timing/PlatformTimer';
import type { Timer } from '@/application/Common/Timing/Timer';
import { getUnsafeTypedEntries } from '@/TypeHelpers';

export type AnimationFunction = (element: Element) => Promise<void>;

export function useExpandCollapseAnimation(
  timer: Timer = PlatformTimer,
): {
    readonly collapse: AnimationFunction;
    readonly expand: AnimationFunction;
  } {
  return {
    collapse: (element: Element) => animateCollapse(element, timer),
    expand: (element: Element) => animateExpand(element, timer),
  };
}

function animateCollapse(
  element: Element,
  timer: Timer,
): Promise<void> {
  return new Promise((resolve) => {
    assertElementIsHTMLElement(element);
    applyStyleMutations(element, (elementStyle) => {
      const measuredStyles = captureTransitionDimensions(element, elementStyle);
      setTransitionPropertiesToHidden(elementStyle);
      hideOverflow(elementStyle);
      triggerElementRepaint(element);
      setTransitionPropertiesToElementDimensions(elementStyle, measuredStyles);
      startTransition(elementStyle, timer).then(() => {
        elementStyle.restoreOriginalStyles();
        resolve();
      });
    });
  });
}

function animateExpand(
  element: Element,
  timer: Timer,
): Promise<void> {
  return new Promise((resolve) => {
    assertElementIsHTMLElement(element);
    applyStyleMutations(element, (elementStyle) => {
      const measuredStyles = captureTransitionDimensions(element, elementStyle);
      setTransitionPropertiesToElementDimensions(elementStyle, measuredStyles);
      hideOverflow(elementStyle);
      triggerElementRepaint(element);
      setTransitionPropertiesToHidden(elementStyle);
      startTransition(elementStyle, timer).then(() => {
        elementStyle.restoreOriginalStyles();
        resolve();
      });
    });
  });
}

export const TRANSITION_DURATION_MILLISECONDS = 300;

const TRANSITION_EASING_FUNCTION = 'ease-in-out';

function startTransition(
  styleMutator: ElementStyleMutator,
  timer: Timer,
): Promise<void> {
  return new Promise((resolve) => {
    styleMutator.changeStyle('transition', createTransitionStyleValue());
    timer.setTimeout(() => resolve(), TRANSITION_DURATION_MILLISECONDS);
  });
}

interface ElementStyleMutator {
  readonly restoreOriginalStyles: () => void;
  readonly changeStyle: (key: MutatedStyleProperty, value: string) => void;
}

function applyStyleMutations(
  element: HTMLElement,
  mutator: (elementStyle: ElementStyleMutator) => void,
) {
  const originalStyles = getOriginalStyles(element);
  const changeStyle = (key: MutatedStyleProperty, value: string) => {
    element.style[key] = value;
  };
  mutator({
    restoreOriginalStyles: () => restoreOriginalStyles(element, originalStyles),
    changeStyle,
  });
}

function setTransitionPropertiesToHidden(elementStyle: ElementStyleMutator): void {
  TransitionedStyleProperties.forEach((key) => {
    elementStyle.changeStyle(key, '0px');
  });
}

function setTransitionPropertiesToElementDimensions(
  elementStyle: ElementStyleMutator,
  elementDimensions: TransitionStyleRecords,
): void {
  getUnsafeTypedEntries(elementDimensions).forEach(([key, value]) => {
    elementStyle.changeStyle(key, value);
  });
}

function hideOverflow(elementStyle: ElementStyleMutator): void {
  elementStyle.changeStyle('overflow', 'hidden');
}

function createTransitionStyleValue(): string {
  const transitions = new Array<string>();
  TransitionedStyleProperties.forEach((key) => {
    transitions.push(`${getCssStyleName(key)} ${TRANSITION_DURATION_MILLISECONDS}ms ${TRANSITION_EASING_FUNCTION}`);
  });
  return transitions.join(', ');
}

function captureTransitionDimensions(
  element: Readonly<HTMLElement>,
  styleMutator: ElementStyleMutator,
): TransitionStyleRecords {
  let styles: TransitionStyleRecords | undefined;
  executeActionWithTemporaryVisibility(
    element.style,
    styleMutator,
    () => {
      styles = {
        height: `${element.offsetHeight}px`,
        paddingTop: element.style.paddingTop || getElementComputedStylePropertyValue(element, 'padding-top'),
        paddingBottom: element.style.paddingBottom || getElementComputedStylePropertyValue(element, 'padding-bottom'),
      };
    },
  );
  return styles as TransitionStyleRecords;
}

function triggerElementRepaint(
  element: Readonly<HTMLElement>,
): void {
  element.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
}

function getElementComputedStylePropertyValue(element: Element, style: string) {
  return getComputedStyle(element, null).getPropertyValue(style);
}

function executeActionWithTemporaryVisibility(
  readableStyle: Readonly<CSSStyleDeclaration>,
  styleMutator: ElementStyleMutator,
  actionWhileRendered: () => void,
) {
  const {
    visibility: initialVisibility,
    display: initialDisplay,
  } = readableStyle;
  styleMutator.changeStyle('visibility', 'hidden');
  styleMutator.changeStyle('display', '');
  try {
    actionWhileRendered();
  } finally {
    styleMutator.changeStyle('visibility', initialVisibility);
    styleMutator.changeStyle('display', initialDisplay);
  }
}

function getOriginalStyles(element: HTMLElement): MutatedStyleProperties {
  const records = {} as MutatedStyleProperties;
  MutatedStylePropertiesDuringAnimation.forEach((key) => {
    records[key] = element.style[key];
  });
  return records;
}

function restoreOriginalStyles(
  element: HTMLElement,
  originalStyles: MutatedStyleProperties,
): void {
  getUnsafeTypedEntries(originalStyles).forEach(([key, value]) => {
    element.style[key] = value;
  });
}

function getCssStyleName(style: AnimatedStyleProperty): string {
  const cssPropertyNames: TransitionStyleRecords = {
    height: 'height',
    paddingTop: 'padding-top',
    paddingBottom: 'padding-bottom',
  };
  return cssPropertyNames[style];
}

function assertElementIsHTMLElement(
  element: Element,
): asserts element is HTMLElement {
  if (!element) {
    throw new Error('Element was not found');
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error('Element is not an HTMLElement');
  }
}

const TransitionedStyleProperties = [
  'height',
  'paddingTop',
  'paddingBottom',
] as const;

const MutatedStylePropertiesDuringAnimation = [
  ...TransitionedStyleProperties,
  'transition',
  'overflow',
  'visibility',
  'display',
] as const;

type MutatedStyleProperty = typeof MutatedStylePropertiesDuringAnimation[number];

export type MutatedStyleProperties = Record<MutatedStyleProperty, string>;

type AnimatedStyleProperty = typeof TransitionedStyleProperties[number];

type TransitionStyleRecords = Record<AnimatedStyleProperty, string>;
