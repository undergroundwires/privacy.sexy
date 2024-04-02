export function getCurrentHighlightRange() {
  return cy
    .get('#codeEditor')
    .invoke('attr', 'data-test-highlighted-range')
    .should('be.a', 'string')
    .should('not.equal', '');
}
