const packageJson = require('./package.json');

// Send data to application runtime
process.env.VUE_APP_VERSION         = packageJson.version;
process.env.VUE_APP_NAME            = packageJson.name;
process.env.VUE_APP_REPOSITORY_URL  = packageJson.repository.url;
process.env.VUE_APP_HOMEPAGE_URL    = packageJson.homepage;

module.exports = {
    chainWebpack: (config) => {
        changeAppEntryPoint('./src/presentation/main.ts', config);
    },
    pluginOptions: {
        // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#native-modules
        electronBuilder: {
            mainProcessFile: './src/presentation/background.ts', // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#webpack-configuration
            nodeIntegration: true, // required to reach Node.js APIs for environment specific logic
            // https://www.electron.build/configuration/configuration
            builderOptions: {
                publish: [{
                    // https://www.electron.build/configuration/publish#githuboptions
                    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#enable-publishing-to-github
                    provider: 'github',
                    vPrefixedTagName: false, // default: true
                    releaseType: 'release' // or "draft" (default), "prerelease"
                }],
                mac: { // https://www.electron.build/configuration/mac
                    target: 'dmg',
                },
                win: { // https://www.electron.build/configuration/win
                    target: 'nsis',
                },
                linux: { // https://www.electron.build/configuration/linux
                    target: 'AppImage',
                }
            }
        }
    }
}

function changeAppEntryPoint(entryPath, config) {
    config.entry('app').clear().add(entryPath).end();
}
