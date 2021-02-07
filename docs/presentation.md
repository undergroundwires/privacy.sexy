# Presentation layer

- Consists of Vue.js components and other UI-related code.
- Desktop application is created using [Electron](https://www.electronjs.org/).
- Event driven as in components simply listens to events from the state and act accordingly.

## Application data

- Components and should use [ApplicationFactory](./../src/application/ApplicationFactory.ts) singleton to reach the application domain.
- [Application.ts](../src/domain/Application.ts) domain model is the stateless application representation including
  - available scripts, collections as defined in [collection files](./collection-files.md)
  - package information as defined in [`package.json`](./../package.json)
- 📖 See [Application data | Application layer](./presentation.md#application-data) where application data is parsed and compiled.

## Application state

- Stateful components mutate or/and react to state changes in [ApplicationContext](./../src/application/Context/ApplicationContext.ts).
- Stateless components that does not handle state extends `Vue`
- Stateful components that depends on the collection state such as user selection, search queries and more extends [`StatefulVue`](./../src/presentation/StatefulVue.ts)
- The single source of truth is a singleton of the state created and made available to presentation layer by [`StatefulVue`](./../src/presentation/StatefulVue.ts)
- `StatefulVue` includes abstract `handleCollectionState` that is fired once the component is loaded and also each time [collection](./collection-files.md) is changed.
- Do not forget to subscribe from events when component is destroyed or if needed [collection](./collection-files.md) is changed.
  - 💡 `events` in base class [`StatefulVue`](./../src/presentation/StatefulVue.ts) makes lifecycling easier
- 📖 See [Application state | Application layer](./presentation.md#application-state) where the state is implemented using using state pattern.
