import { formatAssertionMessage } from '../shared/FormatAssertionMessage';

describe('has no unintended overflow', () => {
  it('fits the content without horizontal scroll', () => {
    // arrange
    cy.viewport(375, 667); // iPhone SE
    // act
    cy.visit('/');
    // assert
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth, formatAssertionMessage([
        `Window inner dimensions: ${win.innerWidth}x${win.innerHeight}`,
        `Window outer dimensions: ${win.outerWidth}x${win.outerHeight}`,
        `Body scrollWidth: ${win.document.body.scrollWidth}`,
        `Body clientWidth: ${win.document.body.clientWidth}`,
        `Body offsetWidth: ${win.document.body.offsetWidth}`,
        `DocumentElement clientWidth: ${win.document.documentElement.clientWidth}`,
        `DocumentElement offsetWidth: ${win.document.documentElement.offsetWidth}`,
        `Meta viewport content: ${win.document.querySelector('meta[name="viewport"]')?.getAttribute('content')}`,
        `Device Pixel Ratio: ${win.devicePixelRatio}`,
        `Cypress Viewport: ${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`,
      ])).to.be.lte(win.innerWidth);
    });
  });
});
