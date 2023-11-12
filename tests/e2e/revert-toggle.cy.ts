import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('revert toggle', () => {
  context('toggle switch', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('.card')
        .eq(1) // to get 2nd element, first is often cleanup that may lack revert button
        .click(); // open the card card
      cy.get('.toggle-switch')
        .first()
        .as('toggleSwitch');
    });

    it('should be visible', () => {
      cy.get('@toggleSwitch')
        .should('be.visible');
    });

    it('should have revert label', () => {
      cy.get('@toggleSwitch')
        .find('span')
        .contains('revert');
    });

    it('should render label completely without clipping', () => {
      cy
        .get('@toggleSwitch')
        .find('span')
        .should(($label) => {
          const text = $label.text();
          const font = getFont($label[0]);
          const expectedMinimumTextWidth = getTextWidth(text, font);
          const containerWidth = $label.parent().width();
          expectExists(containerWidth);
          expect(expectedMinimumTextWidth).to.be.lessThan(containerWidth);
        });
    });
  });
});

function getFont(element: Element): string {
  const computedStyle = window.getComputedStyle(element);
  return `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
}

function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get 2D context from canvas element');
  }
  ctx.font = font;
  const measuredWidth = ctx.measureText(text).width;
  return measuredWidth;
}
