import { ViewportTestScenarios, LargeScreen } from './support/scenarios/viewport-test-scenarios';
import { openCard } from './support/interactions/card';
import { selectAllScripts, unselectAllScripts } from './support/interactions/script-selection';
import { assertLayoutStability } from './support/assert/layout-stability';

describe('Layout stability', () => {
  ViewportTestScenarios.forEach(({ // some shifts are observed only on extra small or large screens
    name, width, height,
  }) => {
    // Regression test for a bug where opening a modal caused layout shift
    describe('Modal interaction', () => {
      it(name, () => {
        // arrange
        cy.viewport(width, height);
        cy.visit('/');
        // act & assert
        assertLayoutStability('body', () => {
          cy
            .contains('button', 'Privacy')
            .click();
          cy
            .get('.modal-content-content')
            .should('be.visible');
        });
      });
    });

    // Regression test for a bug where selecting a script with an open card caused layout shift
    describe('Initial script selection', () => {
      it(name, () => {
        // arrange
        cy.viewport(width, height);
        cy.visit('/');
        cy.contains('span', 'Windows')
          .click();
        // act & assert
        assertLayoutStability('#app', () => {
          openCard({
            cardIndex: 0,
          });
          selectAllScripts();
        });
      });
    });

    // Regression test for a bug where unselecting selected with an open card caused layout shift
    describe('Deselection script selection', () => {
      it(name, () => {
        // arrange
        cy.viewport(width, height);
        cy.visit('/');
        cy.contains('span', 'Windows')
          .click();
        openCard({
          cardIndex: 0,
        });
        selectAllScripts();
        // act & assert
        assertLayoutStability('#app', () => {
          unselectAllScripts();
        });
      });
    });
  });

  // Regression test for bug on Chromium where horizontal scrollbar visibility causes layout shifts.
  it('Scrollbar visibility', () => {
    // arrange
    cy.viewport(LargeScreen.width, LargeScreen.height);
    cy.visit('/');
    openCard({
      cardIndex: 0,
    });
    // act
    assertLayoutStability('.app__wrapper', () => {
      cy.viewport(LargeScreen.width, 100); // Set small height to trigger horizontal scrollbar.
    }, { excludeHeight: true });
  });
});
