import { defineConfig } from 'cypress';
import ViteConfig from './vite.config';

const CYPRESS_BASE_DIR = 'tests/e2e/';

export default defineConfig({
  fixturesFolder: `${CYPRESS_BASE_DIR}/fixtures`,
  screenshotsFolder: `${CYPRESS_BASE_DIR}/screenshots`,

  video: true,
  videosFolder: `${CYPRESS_BASE_DIR}/videos`,

  e2e: {
    baseUrl: `http://localhost:${ViteConfig.server.port}/`,
    specPattern: `${CYPRESS_BASE_DIR}/**/*.cy.{js,jsx,ts,tsx}`, // Default: cypress/e2e/**/*.cy.{js,jsx,ts,tsx}
    supportFile: `${CYPRESS_BASE_DIR}/support/e2e.ts`,
  },
});
