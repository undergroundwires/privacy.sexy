# Presentation layer

The presentation layer handles UI concerns using Vue as JavaScript framework and Electron to provide desktop functionality.

It reflects the [application state](./application.md#application-state) and allows user interactions to modify it. Components manage their own local UI state.

The presentation layer uses an event-driven architecture for bidirectional reactivity between the application state and UI. State change events flow bottom-up to trigger UI updates, while user events flow top-down through components, some ultimately modifying the application state.

📖 Refer to [architecture.md (Layered Application)](./architecture.md#layered-application) to read more about the layered architecture.

## Structure

- [`/src/` **`presentation/`**](./../src/presentation/): Contains Vue and Electron code.
  - [**`bootstrapping/`**](./../src/presentation/bootstrapping/): Registers Vue components and plugins.
  - [**`components/`**](./../src/presentation/components/): Contains Vue components and helpers.
    - [**`Shared/`**](./../src/presentation/components/Shared): Contains shared Vue components and helpers.
      - [**`hooks`**](../src/presentation/components/Shared/Hooks): Hooks used by components through [dependency injection](#dependency-injections).
  - [**`/public/`**](../src/presentation/public/): Contains static assets.
  - [**`assets/`**](./../src/presentation/assets/styles/): Contains assets processed by Vite.
    - [**`fonts/`**](./../src/presentation/assets/fonts/): Contains fonts.
    - [**`styles/`**](./../src/presentation/assets/styles/): Contains shared styles.
      - [**`components/`**](./../src/presentation/assets/styles/components): Contains styles for Vue components.
      - [**`vendors-extensions/`**](./../src/presentation/assets/styles/third-party-extensions): Contains styles for third-party components.
      - [**`main.scss`**](./../src/presentation/assets/styles/main.scss): Main Sass file, imported by other components as single entrypoint.
  - [**`main.ts`**](./../src/presentation/main.ts): Starts Vue app.
  - [**`electron/`**](./../src/presentation/electron/): Contains Electron code.
    - [`/main/` **`index.ts`**](./../src/presentation/main.ts): Main entry for Electron, managing application windows and lifecycle events.
    - [`/preload/` **`index.ts`**](./../src/presentation/main.ts): Script executed before the renderer, securing Node.js features for renderer use.
- [**`/vite.config.ts`**](./../vite.config.ts): Contains Vite configurations for building web application.
- [**`/electron.vite.config.ts`**](./../electron.vite.config.ts): Contains Vite configurations for building desktop applications.
- [**`/postcss.config.cjs`**](./../postcss.config.cjs): Contains PostCSS configurations for Vite.

## Visual design best-practices

Add visual clues for clickable items. It should be as clear as possible that they're interactable at first look without hovering. They should also have different visual state when hovering/touching on them that indicates that they are being clicked, which helps with accessibility.

## Application data

Components (should) use [`UseApplication`](./../src/presentation/components/Shared/Hooks/UseApplication.ts) to reach the application domain to avoid [parsing and compiling](./application.md#parsing-and-compiling) the application again.

[Application.ts](../src/domain/Application.ts) is an immutable domain model that represents application state. It includes:

- available scripts, collections as defined in [collection files](./collection-files.md),
- package information as defined in [`package.json`](./../package.json).

You can read more about how application layer provides application data to he presentation in [application.md | Application data](./application.md#application-data).

## Application state

This project uses a singleton instance of the application state, making it available to all Vue components.

The decision to not use third-party state management libraries like [`vuex`](https://web.archive.org/web/20230801191617/https://vuex.vuejs.org/) or [`pinia`](https://web.archive.org/web/20230801191743/https://pinia.vuejs.org/) was made to promote code independence and enhance portability.

Stateful components can mutate and/or react to state changes (e.g., user selection, search queries) in the [ApplicationContext](./../src/application/Context/ApplicationContext.ts). Vue components import [`CollectionState.ts`](./../src/presentation/components/Shared/Hooks/UseCollectionState.ts) to access both the application context and the state.

[`UseCollectionState.ts`](./../src/presentation/components/Shared/Hooks/UseCollectionState.ts) provides several functionalities including:

- **Singleton State Instance**: It creates a singleton instance of the state, which is shared across the presentation layer. The singleton instance ensures that there's a single source of truth for the application's state.
- **State Change Callback and Lifecycle Management**: It offers a mechanism to register callbacks, which will be invoked when the state initializes or mutates. It ensures that components unsubscribe from state events when they are no longer in use or when [ApplicationContext](./../src/application/Context/ApplicationContext.ts) switches the active [collection](./collection-files.md).
- **State Access and Modification**: It provides functions to read and mutate for accessing and modifying the state, encapsulating the details of these operations.
- **Event Subscription Lifecycle Management**: Includes an `events` member that simplifies state subscription lifecycle events. This ensures that components unsubscribe from state events when they are no longer in use, or when [ApplicationContext](./../src/application/Context/ApplicationContext.ts) switches the active [collection](./collection-files.md).

📖 Refer to [architecture.md | Application State](./architecture.md#application-state) for an overview of event handling and [application.md | Application State](./presentation.md#application-state) for an in-depth understanding of state management in the application layer.

## Dependency injections

The presentation layer uses Vue's native dependency injection system to increase testability and decouple components.

To add a new dependency:

1. **Define its symbol**: Define an associated symbol for every dependency in [`injectionSymbols.ts`](./../src/presentation/injectionSymbols.ts). Symbols are grouped into:
   - **Singletons**: Shared across components, instantiated once.
   - **Transients**: Factories yielding a new instance on every access.
2. **Provide the dependency**: Modify the [`provideDependencies`](./../src/presentation/bootstrapping/DependencyProvider.ts) function to include the new dependency. [`App.vue`](./../src/presentation/components/App.vue) calls this function within its `setup()` hook to register the dependencies.
3. **Inject the dependency**: Use Vue's `inject` method alongside the defined symbol to incorporate the dependency into components.
   - For singletons, invoke the factory method: `inject(symbolKey)()`.
   - For transients, directly inject: `inject(symbolKey)`.

## Shared UI components

Shared UI components promote consistency and simplifies the creation of the front-end.

In order to maintain portability and easy maintainability, the preference is towards using homegrown components over third-party ones or comprehensive UI frameworks like Quasar.

Shared components include:

- [ModalDialog.vue](./../src/presentation/components/Shared/Modal/ModalDialog.vue) is utilized for rendering modal windows.
- [TooltipWrapper.vue](./../src/presentation/components/Shared/TooltipWrapper.vue) acts as a wrapper for rendering tooltips.

## Desktop builds

Desktop builds uses `electron-vite` to bundle the code, and `electron-builder` to build and publish the packages.

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
  