# Application

- It's mainly responsible for
  - creating and event based [application state](#application-state)
  - parsing and compiling [application data](#application-data)

## Application state

- [ApplicationContext.ts](./../src/application/Context/ApplicationContext.ts) holds the [CategoryCollectionState](./../src/application/Context/State/CategoryCollectionState.ts) for each OS
- Uses [state pattern](https://en.wikipedia.org/wiki/State_pattern)
- Same instance is shared throughout the application to ensure consistent state
- 📖 See [Application State | Presentation layer](./presentation.md#application-state) to read more about how the state should be managed by the presentation layer.
- 📖 See [ApplicationContext.ts](./../src/application/Context/ApplicationContext.ts) to start diving into the state code.

## Application data

- Compiled to `Application` domain object.
- The scripts are defined and controlled in different data files per OS
- Enables [data-driven programming](https://en.wikipedia.org/wiki/Data-driven_programming) and easier contributions
- Application data is defined in collection files and
- 📖 See [Application data | Presentation layer](./presentation.md#application-data) to read how the application data is read by the presentation layer.
- 📖 See [collection files documentation](./collection-files.md) to read more about how the data files are structured/defined and see [collection yaml files](./../src/application/collections/) to directly check the code.
