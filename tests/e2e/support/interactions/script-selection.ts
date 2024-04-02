import { getCurrentHighlightRange } from './code-area';

export function selectAllScripts() {
  cy.contains('span', 'All')
    .click();
  getCurrentHighlightRange()
    .should('not.equal', '0');
}

export function unselectAllScripts() {
  cy.contains('span', 'None')
    .click();
  getCurrentHighlightRange()
    .should('equal', '0');
}
