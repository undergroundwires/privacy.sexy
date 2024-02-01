import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { openCard } from './support/interactions/card';

describe('revert toggle', () => {
  context('toggle switch', () => {
    beforeEach(() => {
      cy.visit('/');
      openCard({
        cardIndex: 1, // first is often cleanup that may lack revert button
      });
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
        .contains('revert', { matchCase: false });
    });

    it('should render label completely without clipping', () => { // Regression test for a bug where label is partially rendered (clipped)
      cy
        .get('@toggleSwitch')
        .find('span')
        .should(($label) => {
          const text = $label.text();
          const font = getFont($label[0]);
          const expectedMinimumTextWidth = getTextWidth(text, font);
          const containerWidth = $label.parent().width();
          expectExists(containerWidth);
          expect(expectedMinimumTextWidth).to.be.lessThan(containerWidth, formatAssertionMessage([
            'Label is not rendered completely.',
            `Expected minimum text width: ${expectedMinimumTextWidth}`,
            `Actual text container width: ${containerWidth}`,
          ]));
        });
    });

    it('should toggle the revert state when clicked', () => {
      cy.get('@toggleSwitch').then(($toggleSwitch) => {
        // arrange
        const initialState = $toggleSwitch.find('.toggle-input').is(':checked');

        // act
        cy.wrap($toggleSwitch).click();

        // assert
        cy.wrap($toggleSwitch).find('.toggle-input').should(($input) => {
          const newState = $input.is(':checked');
          expect(newState).to.not.equal(initialState);
        });
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
