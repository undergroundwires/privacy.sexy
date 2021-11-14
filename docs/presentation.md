# Presentation layer

- Consists of Vue.js components and other UI-related code.
- Desktop application is created using [Electron](https://www.electronjs.org/).
- Event driven as in components simply listens to events from the state and act accordingly.

## Structure

- [`/src/` **`presentation/`**](./../src/presentation/): Contains all presentation related code including Vue and Electron configurations
  - [**`bootstrapping/`**](./../src/presentation/bootstrapping/): Registers Vue global objects including components and plugins.
  - [**`components/`**](./../src/presentation/components/): Contains all Vue components and their helper classes.
    - [**`Shared/`**](./../src/presentation/components/Shared): Contains Vue components and component helpers that are shared across other components.
  - [**`assets/`**](./../src/presentation/assets/styles/): Contains assets that will be processed by webpack.
    - [**`fonts/`**](./../src/presentation/assets/fonts/): Contains fonts
    - [**`styles/`**](./../src/presentation/assets/styles/): Contains shared styles used throughout different components.
      - [**`components/`**](./../src/presentation/assets/styles/components): Contains styles that are reusable and tightly coupled a Vue/HTML component.
      - [**`vendors-extensions/`**](./../src/presentation/assets/styles/third-party-extensions): Contains styles that override third-party components used.
      - [**`main.scss`**](./../src/presentation/assets/styles/main.scss): Primary Sass file, passes along all other styles, should be the only file used from other components.
  - [**`main.ts`**](./../src/presentation/main.ts): Application entry point that mounts and starts Vue application.
  - [**`electron/`**](./../src/presentation/electron/): Electron configuration for the desktop application.
    - [**`main.ts`**](./../src/presentation/main.ts): Main process of Electron, started as first thing when app starts.
- [**`/public/`**](./../public/): Contains static assets that will directly be copied and not go through webpack.
- [**`/vue.config.js`**](./../vue.config.js): Global Vue CLI configurations loaded by `@vue/cli-service`
- [**`/postcss.config.js`**](./../postcss.config.js): PostCSS configurations that are used by Vue CLI internally
- [**`/babel.config.js`**](./../babel.config.js): Babel configurations for polyfills used by `@vue/cli-plugin-babel`

## Application data

- Components and should use [ApplicationFactory](./../src/application/ApplicationFactory.ts) singleton to reach the application domain.
- [Application.ts](../src/domain/Application.ts) domain model is the stateless application representation including
  - available scripts, collections as defined in [collection files](./collection-files.md)
  - package information as defined in [`package.json`](./../package.json)
- 📖 See [Application data | Application layer](./presentation.md#application-data) where application data is parsed and compiled.

## Application state

- Stateful components mutate or/and react to state changes in [ApplicationContext](./../src/application/Context/ApplicationContext.ts).
- Stateless components that does not handle state extends `Vue`
- Stateful components that depends on the collection state such as user selection, search queries and more extends [`StatefulVue`](./../src/presentation/components/Shared/StatefulVue.ts)
- The single source of truth is a singleton of the state created and made available to presentation layer by [`StatefulVue`](./../src/presentation/components/Shared/StatefulVue.ts)
- `StatefulVue` includes abstract `handleCollectionState` that is fired once the component is loaded and also each time [collection](./collection-files.md) is changed.
- Do not forget to subscribe from events when component is destroyed or if needed [collection](./collection-files.md) is changed.
  - 💡 `events` in base class [`StatefulVue`](./../src/presentation/components/Shared/StatefulVue.ts) makes lifecycling easier
- 📖 See [Application state | Application layer](./presentation.md#application-state) where the state is implemented using using state pattern.

## Modals

- [Dialog.vue](./../src/presentation/components/Shared/Dialog.vue) is a shared component that can be used to show modal windows
- Simply wrap the content inside of its slot and call `.show()` method on its reference.
- Example:

  ```html
    <Dialog ref="testDialog">
      <div>Hello world</div>
    </Dialog>
    <div @click="$refs.testDialog.show()">Show dialog</div>
  ```

## Sass naming convention

- Use lowercase for variables/functions/mixins e.g.
  - Variable: `$variable: value;`
  - Function: `@function function() {}`
  - Mixin: `@mixin mixin() {}`
- Use - for a phrase/compound word e.g.
  - Variable: `$some-variable: value;`
  - Function: `@function some-function() {}`
  - Mixin: `@mixin some-mixin() {}`
- Grouping and name variables from generic to specific e.g.
  - ✅ `$border-blue`, `$border-blue-light`, `$border-blue-lightest`, `$border-red`
  - ❌ `$blue-border`, `$light-blue-border`, `$lightest-blue-border`, `$red-border`
  