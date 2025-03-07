import { getHeaderBrandTitle } from './support/interactions/header';

export const SplashScreenDom = {
  id: 'splash-screen',
  selector: '#splash-screen',
  classes: {
    fading: 'splash-screen--fading',
  },
  events: {
    appReady: 'app-ready',
  },
  animations: {
    fadeOut: 'splash-animation-fade-out',
  },
  selectors: {
    logo: '.splash-screen__logo',
    mainText: '.splash-screen__text--large',
    delayedText: '.splash-screen__text--delayed',
  },
};

describe('splash screen', () => {
  it('visible on initial page load', () => {
    // act
    loadWithPreventingAppReady();

    // assert
    cy.get(SplashScreenDom.selector)
      .should('be.visible')
      .should('not.have.class', SplashScreenDom.classes.fading);
    cy.get(SplashScreenDom.selectors.logo).should('be.visible');
    cy.get(SplashScreenDom.selectors.mainText).should('not.be.empty');
  });

  it('initially hides the delayed message', () => {
    // act
    loadWithPreventingAppReady();

    // assert
    cy.get(SplashScreenDom.selectors.delayedText).should('have.css', 'visibility', 'hidden');
  });

  it('starts fading out when app-ready event is fired', () => {
    // arrange
    loadWithPreventingAppReady();

    // act
    forceTriggerAppReady();

    // assert
    cy.get(SplashScreenDom.selector).should('have.class', SplashScreenDom.classes.fading);
  });

  it('removed from DOM after animation completes', () => {
    // arrange
    loadWithPreventingAppReady();

    // act
    forceTriggerAppReady();
    simulateFadeOutAnimationEnd();

    // assert
    waitForSplashScreenRemoval();
  });

  it('app UI is visible after splash screen removal', () => {
    // arrange
    loadWithPreventingAppReady();

    // act
    forceTriggerAppReady();
    waitForSplashScreenRemoval();

    // assert
    getHeaderBrandTitle(); // Core UI elements should be visible
  });

  it('has accessibility attributes', () => {
    // act
    loadWithPreventingAppReady();

    // assert
    cy
      .get(SplashScreenDom.selector)
      .then(($el) => {
        expect($el).to.have.attr('role');
        expect($el).to.have.attr('aria-live');
        expect($el).to.have.attr('aria-label');
      });
  });
});

function loadWithPreventingAppReady() {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      const originalDispatchEvent = win.document.dispatchEvent;
      // Prevent app-ready event
      const eventTarget = win.document;
      eventTarget.dispatchEvent = (event) => {
        if (event.type === SplashScreenDom.events.appReady) {
          return true;
        }
        return originalDispatchEvent.call(eventTarget, event);
      };
      // Clean-up monkey patching
      cy.on('test:after:run', () => {
        win.document.dispatchEvent = originalDispatchEvent;
      });
    },
  });
}

function forceTriggerAppReady() {
  cy.window().then((win) => {
    const nativeDispatchEvent = EventTarget.prototype.dispatchEvent;
    const event = new CustomEvent(SplashScreenDom.events.appReady);
    nativeDispatchEvent.call(win.document, event);
  });
}

function waitForSplashScreenRemoval() {
  cy
    .get(SplashScreenDom.selector)
    .should('not.exist');
}

function simulateFadeOutAnimationEnd() {
  cy.get(SplashScreenDom.selector).then(($splash) => {
    const animEndEvent = new AnimationEvent('animationend', {
      animationName: SplashScreenDom.animations.fadeOut,
      bubbles: true,
    });
    $splash[0].dispatchEvent(animEndEvent);
  });
}
