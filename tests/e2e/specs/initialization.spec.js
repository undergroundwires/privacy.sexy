describe('application is initialized as expected', () => {
  it('loads title as expected', () => {
    // act
    cy.visit('/');
    // assert
    cy.contains('h1', 'privacy.sexy')
  });
  it('there are no console.error output', () => {
    // act
    // https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-spy-on-console-log
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError')
      }
    });
    // assert
    cy.get('@consoleError').should('have.not.been.called');
  });
  it('there are no console.warn output', () => {
    // act
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'warn').as('consoleWarn')
      }
    });
    // assert
    cy.get('@consoleWarn').should('have.not.been.called');
  });
  it('there are no console.log output', () => {
    // act
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('consoleLog')
      }
    });
    // assert
    cy.get('@consoleLog').should('have.not.been.called');
  });
});
