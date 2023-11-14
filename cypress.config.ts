import { defineConfig } from 'cypress';
import ViteConfig from './vite.config';
import cypressDirs from './cypress-dirs.json' assert { type: 'json' };

export default defineConfig({
  fixturesFolder: `${cypressDirs.base}/fixtures`,
  screenshotsFolder: cypressDirs.screenshots,

  video: true,
  videosFolder: cypressDirs.videos,

  e2e: {
    baseUrl: `http://localhost:${getApplicationPort()}/`,
    specPattern: `${cypressDirs.base}/**/*.cy.{js,jsx,ts,tsx}`, // Default: cypress/e2e/**/*.cy.{js,jsx,ts,tsx}
    supportFile: `${cypressDirs.base}/support/e2e.ts`,
  },
});

function getApplicationPort(): number {
  const port = ViteConfig.server?.port;
  if (port === undefined) {
    throw new Error('Unknown application port');
  }
  return port;
}
