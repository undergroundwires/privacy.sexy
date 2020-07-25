process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
    pluginOptions: {
        // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#native-modules
        electronBuilder: {
            // https://www.electron.build/configuration/configuration
            builderOptions: {
                win: {
                    icon: './public/favicon.ico'
                },
                publish: [{
                    // https://www.electron.build/configuration/publish#githuboptions
                    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#enable-publishing-to-github
                    provider: 'github',
                    vPrefixedTagName: false, // default: true
                    releaseType: 'release' // or "draft" (default), "prerelease"
                }] 
            }
        }
    }
}