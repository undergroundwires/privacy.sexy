# Presentation layer

Presentation layer consists of UI-related code. It uses Vue.js as JavaScript framework and includes Vue.js components. It also includes [Electron](https://www.electronjs.org/) to provide functionality to desktop application.

It's designed event-driven from bottom to top. It listens user events (from top) and state events (from bottom) to update state or the GUI.

📖 Refer to [architecture.md (Layered Application)](./architecture.md#layered-application) to read more about the layered architecture.

## Structure

- [`/src/` **`presentation/`**](./../src/presentation/): Contains all presentation related code including Vue and Electron configurations
  - [**`bootstrapping/`**](./../src/presentation/bootstrapping/): Registers Vue global objects including components and plugins.
  - [**`components/`**](./../src/presentation/components/): Contains all Vue components and their helper classes.
    - [**`Shared/`**](./../src/presentation/components/Shared): Contains Vue components and component helpers that other components share.
  - [**`assets/`**](./../src/presentation/assets/styles/): Contains assets that webpack will process.
    - [**`fonts/`**](./../src/presentation/assets/fonts/): Contains fonts
    - [**`styles/`**](./../src/presentation/assets/styles/): Contains shared styles used throughout different components.
      - [**`components/`**](./../src/presentation/assets/styles/components): Contains reusable styles coupled to a Vue/HTML component.
      - [**`vendors-extensions/`**](./../src/presentation/assets/styles/third-party-extensions): Contains styles that override third-party components used.
      - [**`main.scss`**](./../src/presentation/assets/styles/main.scss): Primary Sass file, passes along all other styles, should be the single file used from other components.
  - [**`main.ts`**](./../src/presentation/main.ts): Application entry point that mounts and starts Vue application.
  - [**`electron/`**](./../src/presentation/electron/): Electron configuration for the desktop application.
    - [**`main.ts`**](./../src/presentation/main.ts): Main process of Electron, started as first thing when app starts.
- [**`/public/`**](./../public/): Contains static assets that are directly copied and do not go through webpack.
- [**`/vue.config.js`**](./../vue.config.js): Global Vue CLI configurations loaded by `@vue/cli-service`.
- [**`/postcss.config.js`**](./../postcss.config.js): PostCSS configurations used by Vue CLI internally.
- [**`/babel.config.js`**](./../babel.config.js): Babel configurations for polyfills used by `@vue/cli-plugin-babel`.

## Application data

Components (should) use [ApplicationFactory](./../src/application/ApplicationFactory.ts) singleton to reach the application domain to avoid [parsing and compiling](./application.md#parsing-and-compiling) the application again.

[Application.ts](../src/domain/Application.ts) is an immutable domain model that represents application state. It includes:

- available scripts, collections as defined in [collection files](./collection-files.md),
- package information as defined in [`package.json`](./../package.json).

You can read more about how application layer provides application data to he presentation in [application.md | Application data](./application.md#application-data).

## Application state

Inheritance of a Vue components marks whether it uses application state . Components that does not handle application state extends `Vue`. Stateful components mutate or/and react to state changes (such as user selection or search queries) in [ApplicationContext](./../src/application/Context/ApplicationContext.ts) extend [`StatefulVue`](./../src/presentation/components/Shared/StatefulVue.ts) class to access the context / state.

[`StatefulVue`](./../src/presentation/components/Shared/StatefulVue.ts) functions include:

- Creating a singleton of the state and makes it available to presentation layer as single source of truth.
- Providing virtual abstract `handleCollectionState` callback that it calls when
  - the Vue loads the component,
  - and also every time when state changes.
- Providing `events` member to make lifecycling of state subscriptions events easier because it ensures that components unsubscribe from listening to state events when
  - the component is no longer used (destroyed),
  - an if [ApplicationContext](./../src/application/Context/ApplicationContext.ts) changes the active [collection](./collection-files.md) to a different one.

📖 Refer to [architecture.md | Application State](./architecture.md#application-state) to get an overview of event handling and [application.md | Application State](./presentation.md#application-state) for deeper look into how the application layer manages state.

## Modals

[Dialog.vue](./../src/presentation/components/Shared/Dialog.vue) is a shared component that other components used to show modal windows.

You can use it by wrapping the content inside of its `slot` and call `.show()` function on its reference. For example:

  ```html
    <Dialog ref="testDialog">
      <div>Hello world</div>
    </Dialog>
    <div @click="$refs.testDialog.show()">Show dialog</div>
  ```

## Sass naming convention

- Use lowercase for variables/functions/mixins, e.g.:
  - Variable: `$variable: value;`
  - Function: `@function function() {}`
  - Mixin: `@mixin mixin() {}`
- Use - for a phrase/compound word, e.g.:
  - Variable: `$some-variable: value;`
  - Function: `@function some-function() {}`
  - Mixin: `@mixin some-mixin() {}`
- Grouping and name variables from generic to specific, e.g.:
  - ✅ `$border-blue`, `$border-blue-light`, `$border-blue-lightest`, `$border-red`
  - ❌ `$blue-border`, `$light-blue-border`, `$lightest-blue-border`, `$red-border`
  