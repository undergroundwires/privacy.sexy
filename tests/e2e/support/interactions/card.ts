export function openCard(options: {
  readonly cardIndex: number;
}) {
  cy.get('.card')
    .eq(options.cardIndex)
    .click();
}
