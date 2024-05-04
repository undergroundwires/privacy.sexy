/* eslint-disable no-template-curly-in-string */

const { join, resolve } = require('node:path');
const { readdirSync, existsSync } = require('node:fs');
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
    buildResources: resolvePathFromProjectRoot('src/presentation/electron/build'),
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
  const absoluteParentDirectory = resolvePathFromProjectRoot(parentDirectory);
  if (!existsSync(absoluteParentDirectory)) {
    return null; // Avoid disrupting other processes such `npm install`.
  }
  const files = readdirSync(absoluteParentDirectory);
  const entryFile = files.find((file) => /^index\.(cjs|mjs|js)$/.test(file));
  if (!entryFile) {
    throw new Error(`Main entry file not found in ${absoluteParentDirectory}.`);
  }
  return join(parentDirectory, entryFile);
}

function resolvePathFromProjectRoot(pathSegment) {
  return resolve(__dirname, pathSegment);
}
