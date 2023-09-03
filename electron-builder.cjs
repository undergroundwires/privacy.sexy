/* eslint-disable no-template-curly-in-string */

const { join } = require('path');
const { electronBundled, electronUnbundled } = require('./dist-dirs.json');

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
    main: join(electronUnbundled, 'main/index.cjs'), // do not `path.resolve`, it expects a relative path
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
