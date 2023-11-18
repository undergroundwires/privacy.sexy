import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { openCard } from './support/interactions/card';

describe('script selection highlighting', () => {
  it('highlights more when multiple scripts are selected', () => {
    // Regression test for a bug where selecting multiple scripts only highlighted the last one.
    cy.visit('/');
    selectLastScript();
    getCurrentHighlightRange((lastScriptHighlightRange) => {
      cy.log(`Highlight height for last script: ${lastScriptHighlightRange}`);
      cy.visit('/');
      selectAllScripts();
      getCurrentHighlightRange((allScriptsHighlightRange) => {
        cy.log(`Highlight height for all scripts: ${allScriptsHighlightRange}`);
        expect(allScriptsHighlightRange).to.be.greaterThan(lastScriptHighlightRange);
      });
    });
  });
});

function selectLastScript() {
  openCard({
    cardIndex: -1, // last card
  });
  cy.get('.node')
    .last()
    .click({ force: true });
}

function selectAllScripts() {
  cy.contains('span', 'All')
    .click();
}

function getCurrentHighlightRange(
  callback: (highlightedRange: number) => void,
) {
  cy
    .get('#codeEditor')
    .invoke('attr', 'data-test-highlighted-range')
    .should('not.be.empty')
    .and('not.equal', '0')
    .then((range) => {
      expectExists(range);
      callback(parseInt(range, 10));
    });
}
