/* eslint-disable no-template-curly-in-string */

const { join } = require('node:path');
const { readdirSync } = require('fs');
const { electronBundled, electronUnbundled } = require('./dist-dirs.json');

/**
* @type {import('electron-builder').Configuration}
* @see https://www.electron.build/configuration/configuration
*/
module.exports = {
  // Common options
  publish: {
    provider: 'github',
    vPrefixedTagName: false, // default: true
    releaseType: 'release', // default: draft
  },
  directories: {
    output: electronBundled,
  },
  extraMetadata: {
    main: findMainEntryFile(
      join(electronUnbundled, 'main'), // do not `path.resolve`, it expects a relative path
    ),
  },

  // Windows
  win: {
    target: 'nsis',
  },
  nsis: {
    artifactName: '${name}-Setup-${version}.${ext}',
  },

  // Linux
  linux: {
    target: 'AppImage',
  },
  appImage: {
    artifactName: '${name}-${version}.${ext}',
  },

  // macOS
  mac: {
    target: 'dmg',
  },
  dmg: {
    artifactName: '${name}-${version}.${ext}',
  },
};

/**
 * Finds by accommodating different JS file extensions and module formats.
 */
function findMainEntryFile(parentDirectory) {
  const files = readdirSync(parentDirectory);
  const entryFile = files.find((file) => /^index\.(cjs|mjs|js)$/.test(file));
  if (!entryFile) {
    throw new Error(`Main entry file not found in ${parentDirectory}.`);
  }
  return join(parentDirectory, entryFile);
}
