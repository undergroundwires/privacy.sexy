import { defineConfig } from 'cypress';
import setupPlugins from './tests/e2e/plugins/index.js';

export default defineConfig({
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  e2e: {
    setupNodeEvents(on, config) {
      return setupPlugins(on, config);
    },
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
  },
});
