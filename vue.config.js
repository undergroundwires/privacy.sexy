const { resolve } = require('path');
const { defineConfig } = require('@vue/cli-service');
const packageJson = require('./package.json');
const tsconfigJson = require('./tsconfig.json');

loadVueAppRuntimeVariables();

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    changeAppEntryPoint('./src/presentation/main.ts', config);
    addWebpackRule('yaml', /\.ya?ml$/, 'js-yaml-loader', config);
  },
  configureWebpack: {
    resolve: {
      alias: {
        ...getAliasesFromTsConfig(),
      },
      fallback: {
        /* Tell webpack to ignore polyfilling them because Node core modules are never used
            for browser code but only for desktop where Electron supports them. */
        ...ignorePolyfills('os', 'child_process', 'fs', 'path'),
      },
    },
    // Fix compilation failing on macOS when running unit/integration tests
    externals: ['fsevents'],
  },
  pluginOptions: {
    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#native-modules
    electronBuilder: {
      mainProcessFile: './src/presentation/electron/main.ts', // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#webpack-configuration
      nodeIntegration: true, // required to reach Node.js APIs for environment specific logic
      // https://www.electron.build/configuration/configuration
      builderOptions: {
        publish: [{
          // https://www.electron.build/configuration/publish#githuboptions
          // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#enable-publishing-to-github
          provider: 'github',
          vPrefixedTagName: false, // default: true
          releaseType: 'release', // or "draft" (default), "prerelease"
        }],
        mac: { // https://www.electron.build/configuration/mac
          target: 'dmg',
        },
        win: { // https://www.electron.build/configuration/win
          target: 'nsis',
        },
        linux: { // https://www.electron.build/configuration/linux
          target: 'AppImage',
        },
      },
    },
  },
});

function addWebpackRule(name, test, loader, config) {
  config.module
    .rule(name)
    .test(test)
    .use(loader)
    .loader(loader)
    .end();
}

function changeAppEntryPoint(entryPath, config) {
  config.entry('app').clear().add(entryPath).end();
}

function loadVueAppRuntimeVariables() {
  process.env.VUE_APP_VERSION = packageJson.version;
  process.env.VUE_APP_NAME = packageJson.name;
  process.env.VUE_APP_REPOSITORY_URL = packageJson.repository.url;
  process.env.VUE_APP_HOMEPAGE_URL = packageJson.homepage;
}

function ignorePolyfills(...moduleNames) {
  return moduleNames.reduce((obj, module) => {
    obj[module] = false;
    return obj;
  }, {});
}

function getAliasesFromTsConfig() {
  const { paths } = tsconfigJson.compilerOptions;
  return Object.keys(paths).reduce((aliases, pathName) => {
    const pathFolder = paths[pathName][0];
    const aliasFolder = pathFolder.substring(0, pathFolder.length - 1); // trim * from end
    const aliasName = pathName.substring(0, pathName.length - 2); // trim /* from end
    const aliasPath = resolve(__dirname, aliasFolder);
    aliases[aliasName] = aliasPath;
    return aliases;
  }, {});
}
