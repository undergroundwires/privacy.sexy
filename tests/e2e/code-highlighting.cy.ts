import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { getCurrentHighlightRange } from './support/interactions/code-area';
import { selectAllScripts } from './support/interactions/script-selection';
import { openCard } from './support/interactions/card';

describe('script selection highlighting', () => {
  // Regression test for a bug where selecting multiple scripts only highlighted the last one.
  it('highlights more when multiple scripts are selected', () => {
    cy.visit('/');
    selectLastScript();
    getNonZeroCurrentHighlightRangeValue().then((lastScriptHighlightRange) => {
      cy.log(`Highlight height for last script: ${lastScriptHighlightRange}`);
      expect(lastScriptHighlightRange).to.be.greaterThan(0);
      cy.visit('/');
      selectAllScripts();
      getNonZeroCurrentHighlightRangeValue().then((allScriptsHighlightRange) => {
        cy.log(`Highlight height for all scripts: ${allScriptsHighlightRange}`);
        expect(allScriptsHighlightRange).to.be.greaterThan(lastScriptHighlightRange);
      });
    });
  });
});

function getNonZeroCurrentHighlightRangeValue() {
  return getCurrentHighlightRange()
    .should('not.equal', '0')
    .then((rangeValue) => {
      expectExists(rangeValue);
      return parseInt(rangeValue, 10);
    });
}

function selectLastScript() {
  openCard({
    cardIndex: -1, // last card
  });
  cy.get('.node')
    .last()
    .click({ force: true });
}
