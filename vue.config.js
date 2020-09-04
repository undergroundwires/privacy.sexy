const packageJson = require('./package.json');

process.env.VUE_APP_VERSION         = packageJson.version;
process.env.VUE_APP_NAME            = packageJson.name;
process.env.VUE_APP_REPOSITORY_URL  = packageJson.repository.url;
process.env.VUE_APP_HOMEPAGE_URL    = packageJson.homepage;

module.exports = {
    pluginOptions: {
        // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#native-modules
        electronBuilder: {
            // https://www.electron.build/configuration/configuration
            builderOptions: {
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