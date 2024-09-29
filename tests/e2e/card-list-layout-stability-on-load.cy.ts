// eslint-disable-next-line max-classes-per-file
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { getHeaderBrandTitle } from './support/interactions/header';
import { ViewportTestScenarios } from './support/scenarios/viewport-test-scenarios';

interface Stoppable {
  stop(): void;
}

describe('card list layout stability', () => {
  describe('during initial page load', () => {
    const testCleanup = new Array<Stoppable>();
    afterEach(() => {
      testCleanup.forEach((c) => c.stop());
      testCleanup.length = 0;
    });
    ViewportTestScenarios.forEach(({ name, width, height }) => {
      it(`ensures layout stability on ${name}`, () => {
        // arrange
        const dimensions = new DimensionsStorage();
        cy.viewport(width, height);
        // act
        cy.window().then((win) => {
          findElementFast(win, '.cards', (cardList) => {
            testCleanup.push(
              new SizeMonitor().start(cardList, () => dimensions.add(captureDimensions(cardList))),
            );
          });
          testCleanup.push(
            new ContinuousRunner()
              .start(() => {
                /*
                  As Cypress does not inherently support CPU throttling, this workaround is used to
                  intentionally slow down Cypress's execution. It allows capturing sudden layout
                  issues, such as brief flashes or shifts.
                */
                cy.window().then(() => {
                  cy.log('Throttling');
                  // eslint-disable-next-line cypress/no-unnecessary-waiting
                  cy.wait(50, { log: false });
                });
              }, 100),
          );
        });
        cy.visit('/');
        for (const assertNextCheckpoint of Object.values(checkpoints)) {
          assertNextCheckpoint();
        }

        // assert
        const widthToleranceInPx = 0;
        const widthsInPx = dimensions.getUniqueWidths();
        expect(isWithinTolerance(widthsInPx, widthToleranceInPx))
          .to.equal(true, formatAssertionMessage([
            `Unique width values over time: ${[...widthsInPx].join(', ')}`,
            `Height changes are more than ${widthToleranceInPx}px tolerance`,
            `Captured metrics: ${dimensions.toString()}`,
          ]));

        const heightToleranceInPx = 100; // Set in relation to card sizes.
        // Tolerance allows for minor layout shifts without (e.g. for icon or font loading)
        // false test failures. The number `100` accounts for shifts when the number of
        // cards per row changes, avoiding failures for shifts less than the smallest card
        // size (~175px).
        const heightsInPx = dimensions.getUniqueHeights();
        expect(isWithinTolerance(heightsInPx, heightToleranceInPx))
          .to.equal(true, formatAssertionMessage([
            `Unique height values over time: ${[...heightsInPx].join(', ')}`,
            `Height changes are more than ${heightToleranceInPx}px tolerance`,
            `Captured metrics: ${dimensions.toString()}`,
          ]));
      });
    });
  });
});

/*
  It finds a DOM element as quickly as possible.
  It's crucial for detecting early layout shifts during page load,
  which may be missed by standard Cypress commands such as `cy.get`, `cy.document`.
*/
function findElementFast(
  win: Cypress.AUTWindow,
  query: string,
  handler: (element: Element) => void,
  timeoutInMs = 10000,
): void {
  const endTime = Date.now() + timeoutInMs;
  const finder = new ContinuousRunner();
  finder.start(() => {
    const element = win.document.querySelector(query);
    if (element) {
      handler(element);
      finder.stop();
      return;
    }
    if (Date.now() >= endTime) {
      finder.stop();
      throw new Error(`Timed out. Failed to find element. Query: ${query}. Timeout: ${timeoutInMs}ms`);
    }
  }, 1 /* As aggressive as possible */);
}

class DimensionsStorage {
  private readonly dimensions = new Array<SizeDimensions>();

  public add(newDimension: SizeDimensions): void {
    if (this.dimensions.length > 0) {
      const lastDimension = this.dimensions[this.dimensions.length - 1];
      if (lastDimension.width === newDimension.width
        && lastDimension.height === newDimension.height) {
        return;
      }
    }
    cy.window().then(() => {
      cy.log(`Captured: ${JSON.stringify(newDimension)}`);
    });
    this.dimensions.push(newDimension);
  }

  public getUniqueWidths(): readonly number[] {
    return [...new Set(this.dimensions.map((d) => d.width))];
  }

  public getUniqueHeights(): readonly number[] {
    return [...new Set(this.dimensions.map((d) => d.height))];
  }

  public toString(): string {
    return JSON.stringify(this.dimensions);
  }
}

function isWithinTolerance(
  numbers: readonly number[],
  tolerance: number,
) {
  let changeWithinTolerance = true;
  const [firstValue, ...otherValues] = numbers;
  let previousValue = firstValue;
  otherValues.forEach((value) => {
    const difference = Math.abs(value - previousValue);
    if (difference > tolerance) {
      changeWithinTolerance = false;
    }
    previousValue = value;
  });
  return changeWithinTolerance;
}

interface SizeDimensions {
  readonly width: number;
  readonly height: number;
}

function captureDimensions(element: Element): SizeDimensions {
  const dimensions = element.getBoundingClientRect(); // more reliable than body.scroll...
  return {
    width: Math.round(dimensions.width),
    height: Math.round(dimensions.height),
  };
}

enum ApplicationLoadStep {
  IndexHtmlLoaded = 0,
  AppVueLoaded = 1,
  HeaderBrandTitleLoaded = 2,
}

const checkpoints: Record<ApplicationLoadStep, () => void> = {
  [ApplicationLoadStep.IndexHtmlLoaded]: () => cy.get('#app').should('be.visible'),
  [ApplicationLoadStep.AppVueLoaded]: () => cy.get('.app__wrapper').should('be.visible'),
  [ApplicationLoadStep.HeaderBrandTitleLoaded]: () => getHeaderBrandTitle(),
};

class ContinuousRunner implements Stoppable {
  private timer: ReturnType<typeof setTimeout> | undefined;

  public start(callback: () => void, intervalInMs: number): this {
    this.stop();
    this.timer = setInterval(() => {
      if (this.isStopped) {
        return;
      }
      callback();
    }, intervalInMs);
    return this;
  }

  public stop() {
    if (this.timer === undefined) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private get isStopped() {
    return this.timer === undefined;
  }
}

class SizeMonitor implements Stoppable {
  private observer: ResizeObserver | undefined;

  public start(element: Element, sizeChangedCallback: () => void): this {
    this.stop();
    this.observer = new ResizeObserver(() => {
      if (this.isStopped) {
        return;
      }
      sizeChangedCallback();
    });
    this.observer.observe(element);
    return this;
  }

  public stop() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private get isStopped() {
    return this.observer === undefined;
  }
}
