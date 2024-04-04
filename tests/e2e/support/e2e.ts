/*
  This file is processed and loaded automatically before test files.
  It's designed to put global configuration and behavior that modifies Cypress.
*/

import './commands';

// Mitigates a Chrome-specific 'ResizeObserver' error in Cypress tests.
// The 'ResizeObserver loop limit exceeded' error is non-critical but can cause
// false negatives in CI/CD environments, particularly with GitHub runners.
// The issue is absent in actual browser usage and local Cypress testing.
// Community discussions and contributions have led to this handler being
// recommended as a user-level fix rather than a Cypress core inclusion.
// Relevant discussions and attempted core fixes:
// - Original fix suggestion: https://github.com/cypress-io/cypress/issues/8418#issuecomment-992564877
// - Proposed Cypress core PRs:
//    https://github.com/cypress-io/cypress/pull/20257
//    https://github.com/cypress-io/cypress/pull/20284
// - Current issue tracking: https://github.com/cypress-io/cypress/issues/20341
// - Related Quasar framework issue: https://github.com/quasarframework/quasar/issues/2233
// - Chromium bug tracker discussion: https://issues.chromium.org/issues/41369140
// - Stack Overflow on safely ignoring the error:
//   https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded/50387233#50387233
//   https://stackoverflow.com/questions/63653605/resizeobserver-loop-limit-exceeded-api-is-never-used/63653711#63653711
// - Spec issue related to 'ResizeObserver': https://github.com/WICG/resize-observer/issues/38
Cypress.on(
  'uncaught:exception',
  // Ignore this specific error to prevent false test failures
  (err) => !err.message.includes('ResizeObserver loop limit exceeded'),
);
