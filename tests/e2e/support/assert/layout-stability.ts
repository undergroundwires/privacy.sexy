import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

interface LayoutStabilityTestOptions {
  excludeWidth: boolean;
  excludeHeight: boolean;
}

export function assertLayoutStability(
  selector: string,
  action: ()=> void,
  options: Partial<LayoutStabilityTestOptions> | undefined = undefined,
): void {
  // arrange
  if (options?.excludeWidth === true && options?.excludeHeight === true) {
    throw new Error('Invalid test configuration: both width and height exclusions specified.');
  }
  let initialMetrics: ViewportMetrics | undefined;
  captureViewportMetrics(selector, (metrics) => {
    initialMetrics = metrics;
  });
  // act
  action();
  // assert
  captureViewportMetrics(selector, (metrics) => {
    const finalMetrics = metrics;
    const assertionContext = [
      `Expected (initial metrics before action): ${JSON.stringify(initialMetrics)}`,
      `Actual (final metrics after action): ${JSON.stringify(finalMetrics)}`,
    ];
    if (options?.excludeWidth !== true) {
      expect(initialMetrics?.x).to.equal(finalMetrics.x, formatAssertionMessage([
        'Width instability detected',
        ...assertionContext,
      ]));
    }
    if (options?.excludeHeight !== true) {
      expect(initialMetrics?.x).to.equal(finalMetrics.x, formatAssertionMessage([
        'Height instability detected',
        ...assertionContext,
      ]));
    }
  });
}

function captureViewportMetrics(
  selector: string,
  callback: (metrics: ViewportMetrics) => void,
): void {
  cy.window().then((win) => {
    cy.get(selector)
      .then((elements) => {
        const element = elements[0];
        const position = getElementViewportMetrics(element, win);
        cy.log(`Captured metrics (\`${selector}\`): ${JSON.stringify(position)}`);
        callback(position);
      });
  });
}

interface ViewportMetrics {
  readonly x: number;
  readonly y: number;
  /*
    Excluding height and width from the metrics to ensure test accuracy.
    Height and width measurements can lead to false negatives due to layout shifts caused by
    delayed loading of fonts and icons.
  */
}

function getElementViewportMetrics(element: HTMLElement, win: Window): ViewportMetrics {
  const elementXRelativeToViewport = getElementXRelativeToViewport(element, win);
  const elementYRelativeToViewport = getElementYRelativeToViewport(element, win);
  return {
    x: elementXRelativeToViewport,
    y: elementYRelativeToViewport,
  };
}

function getElementYRelativeToViewport(element: HTMLElement, win: Window): number {
  const relativeTop = element.getBoundingClientRect().top;
  const { position, top } = win.getComputedStyle(element);
  const topValue = position === 'static' ? 0 : parseInt(top, 10);
  if (Number.isNaN(topValue)) {
    throw new Error(`Could not calculate Y position value from 'top': ${top}`);
  }
  const viewportRelativeY = relativeTop - topValue + win.scrollY;
  return viewportRelativeY;
}

function getElementXRelativeToViewport(element: HTMLElement, win: Window): number {
  const relativeLeft = element.getBoundingClientRect().left;
  const { position, left } = win.getComputedStyle(element);
  const leftValue = position === 'static' ? 0 : parseInt(left, 10);
  if (Number.isNaN(leftValue)) {
    throw new Error(`Could not calculate X position value from 'left': ${left}`);
  }
  const viewportRelativeX = relativeLeft - leftValue + win.scrollX;
  return viewportRelativeX;
}
