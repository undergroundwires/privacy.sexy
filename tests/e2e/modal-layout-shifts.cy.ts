import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { ViewportTestScenarios } from './support/scenarios/viewport-test-scenarios';

describe('Modal interaction and layout stability', () => {
  ViewportTestScenarios.forEach(({ // some shifts are observed only on extra small or large screens
    name, width, height,
  }) => {
    it(name, () => {
      cy.viewport(width, height);
      cy.visit('/');

      let metricsBeforeModal: ViewportMetrics | undefined;

      captureViewportMetrics((metrics) => {
        metricsBeforeModal = metrics;
      });

      cy
        .contains('a', 'Privacy')
        .click();

      cy
        .get('.modal-content')
        .should('be.visible');

      captureViewportMetrics((metrics) => {
        const metricsAfterModal = metrics;
        expect(metricsBeforeModal).to.deep.equal(metricsAfterModal, formatAssertionMessage([
          `Expected (initial metrics before modal): ${JSON.stringify(metricsBeforeModal)}`,
          `Actual (metrics after modal is opened): ${JSON.stringify(metricsAfterModal)}`,
        ]));
      });
    });
  });
});

interface ViewportMetrics {
  readonly x: number;
  readonly y: number;
  /*
    Excluding height and width from the metrics to ensure test accuracy.
    Height and width measurements can lead to false negatives due to layout shifts caused by
    delayed loading of fonts and icons.
  */
}

function captureViewportMetrics(callback: (metrics: ViewportMetrics) => void): void {
  cy.window().then((win) => {
    cy.get('body')
      .then((body) => {
        const position = getElementViewportMetrics(body[0], win);
        cy.log(`Captured metrics: ${JSON.stringify(position)}`);
        callback(position);
      });
  });
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
