import { getHeaderBrandTitle } from './support/interactions/header';

describe('App Ready Event', () => {
  it('fired before app is fully loaded', () => {
    const expectedEventName = 'app-ready';
    const spyName = 'eventSpy';
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.document.addEventListener(expectedEventName, cy.stub().as(spyName));
      },
    });
    getHeaderBrandTitle(); // Wait for the app to be fully loaded
    cy.get(`@${spyName}`)
      .should('have.been.called');
  });
});
