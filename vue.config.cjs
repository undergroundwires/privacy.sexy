/* Keeping here until Vitest migration */

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
    // Use something other than default source mapper or babel cannot
    // log stacks like `console.log(new Error().stack)`
    devtool: 'eval-source-map',
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
  process.env.VUE_APP_SLOGAN = packageJson.slogan;
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
